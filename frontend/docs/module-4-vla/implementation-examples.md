---
sidebar_position: 3
title: "VLA Implementation Examples"
description: "Practical implementation examples of Vision-Language-Action models for robotics"
keywords: ["VLA", "implementation", "robotics", "vision-language-action", "examples", "code"]
---

# VLA Implementation Examples

## Introduction to VLA Implementation

In this chapter, we'll explore practical implementation examples of Vision-Language-Action (VLA) models. These examples will demonstrate how to build, train, and deploy VLA systems for various robotics applications, from simple manipulation tasks to complex multi-step instructions.

## Complete VLA System Architecture

### End-to-End VLA Implementation

```python
# complete_vla_system.py
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as T
import cv2
import numpy as np
from transformers import CLIPVisionModel, CLIPTextModel, CLIPProcessor
from typing import Dict, List, Tuple, Any
import rospy
from sensor_msgs.msg import Image, JointState
from geometry_msgs.msg import Twist
from std_msgs.msg import String
from cv_bridge import CvBridge

class VisionEncoder(nn.Module):
    def __init__(self, pretrained_model="openai/clip-vit-base-patch32"):
        super(VisionEncoder, self).__init__()
        self.clip_vision = CLIPVisionModel.from_pretrained(pretrained_model)
        self.projection = nn.Linear(768, 512)  # CLIP output to 512-dim

    def forward(self, images):
        # images: (batch_size, 3, H, W)
        outputs = self.clip_vision(pixel_values=images)
        # Use the pooled output
        pooled_output = outputs.pooler_output
        projected = self.projection(pooled_output)
        return projected

class LanguageEncoder(nn.Module):
    def __init__(self, pretrained_model="openai/clip-vit-base-patch32"):
        super(LanguageEncoder, self).__init__()
        # We'll use the text encoder from CLIP
        from transformers import CLIPTextModel, AutoTokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(pretrained_model.replace("clip-vit", "clip"))
        self.clip_text = CLIPTextModel.from_pretrained(pretrained_model.replace("vit", ""))

    def forward(self, texts):
        # Tokenize texts
        inputs = self.tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
        outputs = self.clip_text(**inputs)
        # Use the pooled output
        return outputs.pooler_output

class ActionHead(nn.Module):
    def __init__(self, input_dim=1024, action_dim=7):  # 7-DOF robot arm
        super(ActionHead, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, action_dim),
            nn.Tanh()  # Actions in [-1, 1] range
        )

    def forward(self, features):
        return self.network(features)

class VLAModel(nn.Module):
    def __init__(self, vision_encoder, language_encoder, action_head):
        super(VLAModel, self).__init__()
        self.vision_encoder = vision_encoder
        self.language_encoder = language_encoder
        self.action_head = action_head

        # Multimodal fusion
        self.fusion_layer = nn.Linear(1024, 1024)  # 512 + 512 -> 1024

    def forward(self, images, instructions):
        # Encode visual features
        vision_features = self.vision_encoder(images)

        # Encode language features
        language_features = self.language_encoder(instructions)

        # Concatenate multimodal features
        combined_features = torch.cat([vision_features, language_features], dim=-1)
        fused_features = self.fusion_layer(combined_features)

        # Generate action
        action = self.action_head(fused_features)

        return action

class VLAInterface:
    def __init__(self, model_path=None):
        # Initialize components
        self.vision_encoder = VisionEncoder()
        self.language_encoder = LanguageEncoder()
        self.action_head = ActionHead()
        self.model = VLAModel(self.vision_encoder, self.language_encoder, self.action_head)

        # Load pretrained model if path provided
        if model_path:
            self.model.load_state_dict(torch.load(model_path))

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        # ROS interface
        self.bridge = CvBridge()
        self.image_sub = rospy.Subscriber('/camera/image_raw', Image, self.image_callback)
        self.instruction_sub = rospy.Subscriber('/vla/instruction', String, self.instruction_callback)
        self.joint_pub = rospy.Publisher('/joint_group_position_controller/command', JointState, queue_size=10)

        # Internal state
        self.current_image = None
        self.current_instruction = None

    def image_callback(self, msg):
        """Process incoming camera image"""
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            # Preprocess image for model
            transform = T.Compose([
                T.ToPILImage(),
                T.Resize((224, 224)),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            self.current_image = transform(cv_image).unsqueeze(0).to(self.device)
        except Exception as e:
            rospy.logerr(f"Image processing error: {e}")

    def instruction_callback(self, msg):
        """Process incoming instruction"""
        self.current_instruction = [msg.data]  # Batch format for model

    def execute_instruction(self):
        """Execute the current instruction with current image"""
        if self.current_image is None or self.current_instruction is None:
            return None

        with torch.no_grad():
            action = self.model(self.current_image, self.current_instruction)

        # Convert action to robot command
        joint_command = self.action_to_joint_command(action.cpu().numpy()[0])
        self.publish_joint_command(joint_command)

        return action

    def action_to_joint_command(self, action):
        """Convert normalized action to joint positions"""
        # Map from [-1, 1] to actual joint limits
        # This depends on your specific robot
        joint_limits = np.array([[-2.97, 2.97], [-1.83, 1.83], [-2.97, 2.97],
                                [-3.14, 0.0], [-2.97, 2.97], [-3.75, 2.15], [-2.97, 2.97]])

        # Scale action to joint limits
        scaled_action = (action + 1) / 2  # [0, 1]
        joint_positions = joint_limits[:, 0] + scaled_action * (joint_limits[:, 1] - joint_limits[:, 0])

        return joint_positions

    def publish_joint_command(self, joint_positions):
        """Publish joint positions to robot"""
        msg = JointState()
        msg.name = [f'joint_{i}' for i in range(len(joint_positions))]
        msg.position = joint_positions.tolist()
        msg.header.stamp = rospy.Time.now()
        self.joint_pub.publish(msg)

# Example usage
def main():
    rospy.init_node('vla_interface')
    vla_interface = VLAInterface()

    rate = rospy.Rate(10)  # 10 Hz
    while not rospy.is_shutdown():
        vla_interface.execute_instruction()
        rate.sleep()

if __name__ == '__main__':
    main()
```

## Manipulation Task Implementation

### Pick and Place with VLA

```python
# pick_place_vla.py
import torch
import torch.nn as nn
import numpy as np
import cv2
from typing import Dict, List, Tuple
import time

class ManipulationVLA(nn.Module):
    def __init__(self):
        super(ManipulationVLA, self).__init__()

        # Vision encoder for scene understanding
        self.vision_encoder = nn.Sequential(
            nn.Conv2d(3, 32, 8, stride=4),
            nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, stride=1),
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(256, 512),
            nn.ReLU()
        )

        # Language encoder for instruction understanding
        self.language_encoder = nn.Sequential(
            nn.Linear(768, 512),  # Assuming BERT-like embedding
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU()
        )

        # State encoder for robot state
        self.state_encoder = nn.Sequential(
            nn.Linear(7, 256),  # 7-DOF joint positions
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.ReLU()
        )

        # Multimodal fusion
        self.fusion = nn.Sequential(
            nn.Linear(512 + 512 + 512, 1024),  # vision + language + state
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU()
        )

        # Task-specific heads
        self.grasp_head = nn.Linear(512, 3)  # x, y, z grasp position
        self.orientation_head = nn.Linear(512, 4)  # quaternion
        self.gripper_head = nn.Linear(512, 1)  # gripper width

    def forward(self, image, instruction_embedding, robot_state):
        # Encode vision
        vision_features = self.vision_encoder(image)

        # Encode language
        language_features = self.language_encoder(instruction_embedding)

        # Encode state
        state_features = self.state_encoder(robot_state)

        # Fuse multimodal features
        combined = torch.cat([vision_features, language_features, state_features], dim=-1)
        fused = self.fusion(combined)

        # Generate task-specific outputs
        grasp_pos = self.grasp_head(fused)
        orientation = self.orientation_head(fused)
        gripper_width = torch.sigmoid(self.gripper_head(fused))  # [0, 1] range

        return {
            'grasp_position': grasp_pos,
            'orientation': orientation,
            'gripper_width': gripper_width
        }

class PickPlaceController:
    def __init__(self, vla_model):
        self.model = vla_model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

    def execute_pick_and_place(self, image, instruction, current_state):
        """
        Execute pick and place task using VLA model
        """
        # Preprocess inputs
        image_tensor = self.preprocess_image(image).to(self.device)
        instruction_tensor = self.encode_instruction(instruction).to(self.device)
        state_tensor = torch.tensor(current_state, dtype=torch.float32).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(image_tensor, instruction_tensor, state_tensor)

        # Extract predictions
        grasp_pos = outputs['grasp_position'].cpu().numpy()[0]
        orientation = outputs['orientation'].cpu().numpy()[0]
        gripper_width = outputs['gripper_width'].cpu().numpy()[0]

        # Execute the task
        self.move_to_pre_grasp(grasp_pos, orientation)
        self.execute_grasp(gripper_width)
        self.lift_object()
        self.move_to_place_location()
        self.release_object()

        return {
            'grasp_position': grasp_pos,
            'orientation': orientation,
            'gripper_width': gripper_width
        }

    def preprocess_image(self, image):
        """Preprocess image for the model"""
        image = cv2.resize(image, (128, 128))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        return torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    def encode_instruction(self, instruction):
        """Encode instruction using a pre-trained language model"""
        # In practice, you'd use a proper language encoder
        # This is a simplified placeholder
        embedding = np.random.randn(768).astype(np.float32)  # Placeholder
        return torch.tensor(embedding, dtype=torch.float32).unsqueeze(0)

    def move_to_pre_grasp(self, position, orientation):
        """Move robot to pre-grasp position"""
        print(f"Moving to pre-grasp: pos={position}, orient={orientation}")
        # Implementation depends on your robot interface

    def execute_grasp(self, gripper_width):
        """Execute grasp with specified gripper width"""
        print(f"Executing grasp with width: {gripper_width}")
        # Implementation depends on your robot interface

    def lift_object(self):
        """Lift the grasped object"""
        print("Lifting object")
        # Implementation depends on your robot interface

    def move_to_place_location(self):
        """Move to place location"""
        print("Moving to place location")
        # Implementation depends on your robot interface

    def release_object(self):
        """Release the object"""
        print("Releasing object")
        # Implementation depends on your robot interface

# Example usage
def run_pick_place_example():
    model = ManipulationVLA()
    controller = PickPlaceController(model)

    # Simulated inputs
    dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    instruction = "Pick up the red cup and place it on the table"
    current_state = np.random.randn(7).astype(np.float32)  # 7-DOF joint positions

    result = controller.execute_pick_and_place(dummy_image, instruction, current_state)
    print(f"Pick and place completed: {result}")
```

## Navigation Task Implementation

### Language-Guided Navigation

```python
# navigation_vla.py
import torch
import torch.nn as nn
import numpy as np
import cv2
from torch.distributions import Categorical

class NavigationVLA(nn.Module):
    def __init__(self, action_dim=4):  # [forward, left, right, stop]
        super(NavigationVLA, self).__init__()

        # Vision encoder for scene understanding
        self.vision_encoder = nn.Sequential(
            nn.Conv2d(3, 32, 8, stride=4),
            nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, stride=1),
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(1024, 512),  # Assuming 1024 after conv layers
            nn.ReLU()
        )

        # Language encoder for navigation commands
        self.language_encoder = nn.Sequential(
            nn.Linear(512, 512),  # Assuming language embedding size
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU()
        )

        # State encoder for robot pose and velocity
        self.state_encoder = nn.Sequential(
            nn.Linear(6, 256),  # [x, y, theta, vx, vy, vtheta]
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.ReLU()
        )

        # Multimodal fusion
        self.fusion = nn.Sequential(
            nn.Linear(512 + 512 + 512, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU()
        )

        # Action head for navigation
        self.action_head = nn.Linear(512, action_dim)
        self.value_head = nn.Linear(512, 1)

    def forward(self, image, instruction, state):
        # Encode vision
        vision_features = self.vision_encoder(image)

        # Encode language
        language_features = self.language_encoder(instruction)

        # Encode state
        state_features = self.state_encoder(state)

        # Fuse features
        combined = torch.cat([vision_features, language_features, state_features], dim=-1)
        fused = self.fusion(combined)

        # Generate action and value
        action_logits = self.action_head(fused)
        value = self.value_head(fused)

        return action_logits, value

class NavigationAgent:
    def __init__(self, model, device='cpu'):
        self.model = model
        self.device = device
        self.model.to(device)
        self.model.eval()

    def get_action(self, image, instruction, state, deterministic=False):
        """
        Get navigation action based on current observation and instruction
        """
        # Preprocess inputs
        image_tensor = self.preprocess_image(image).to(self.device)
        instruction_tensor = self.encode_instruction(instruction).to(self.device)
        state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0).to(self.device)

        with torch.no_grad():
            action_logits, value = self.model(image_tensor, instruction_tensor, state_tensor)

        if deterministic:
            # Select action with highest probability
            action = torch.argmax(action_logits, dim=-1).item()
        else:
            # Sample from distribution
            action_probs = torch.softmax(action_logits, dim=-1)
            action_dist = Categorical(action_probs)
            action = action_dist.sample().item()

        return action, value.item()

    def preprocess_image(self, image):
        """Preprocess navigation image"""
        image = cv2.resize(image, (128, 128))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        return torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    def encode_instruction(self, instruction):
        """Encode navigation instruction"""
        # Simplified language encoding
        # In practice, use a pre-trained language model
        encoding_map = {
            "go forward": [1.0, 0.0, 0.0, 0.0],
            "turn left": [0.0, 1.0, 0.0, 0.0],
            "turn right": [0.0, 0.0, 1.0, 0.0],
            "stop": [0.0, 0.0, 0.0, 1.0],
            "navigate to": [0.5, 0.5, 0.0, 0.0],  # General navigation
        }

        # Default encoding
        encoding = [0.1, 0.1, 0.1, 0.1]

        for key, value in encoding_map.items():
            if key in instruction.lower():
                encoding = value
                break

        return torch.tensor(encoding, dtype=torch.float32).unsqueeze(0)

class NavigationEnvironment:
    def __init__(self):
        self.position = np.array([0.0, 0.0])
        self.orientation = 0.0  # in radians
        self.velocity = np.array([0.0, 0.0])
        self.obstacles = [
            np.array([2.0, 2.0]),  # x, y position of obstacle
            np.array([-1.0, 3.0])
        ]

    def step(self, action):
        """
        Execute navigation action and return new state
        """
        # Action mapping: 0-forward, 1-left, 2-right, 3-stop
        dt = 0.1  # time step
        max_speed = 1.0

        if action == 0:  # Forward
            self.velocity[0] = max_speed * np.cos(self.orientation)
            self.velocity[1] = max_speed * np.sin(self.orientation)
        elif action == 1:  # Turn left
            self.orientation += 0.3  # radians
            self.velocity[0] = 0.0
            self.velocity[1] = 0.0
        elif action == 2:  # Turn right
            self.orientation -= 0.3  # radians
            self.velocity[0] = 0.0
            self.velocity[1] = 0.0
        else:  # Stop
            self.velocity[0] = 0.0
            self.velocity[1] = 0.0

        # Update position
        self.position += self.velocity * dt

        # Check for collisions
        reward = self.calculate_reward()
        done = self.check_collision() or np.linalg.norm(self.position) > 10.0

        # Return dummy image for simulation
        dummy_image = np.random.randint(0, 255, (128, 128, 3), dtype=np.uint8)

        return dummy_image, self.get_state(), reward, done

    def get_state(self):
        """Get current robot state [x, y, theta, vx, vy, vtheta]"""
        return np.array([
            self.position[0], self.position[1], self.orientation,
            self.velocity[0], self.velocity[1], 0.0  # vtheta is 0 for simplicity
        ])

    def calculate_reward(self):
        """Calculate navigation reward"""
        # Simple reward based on distance to origin (encourage exploration)
        distance_to_origin = np.linalg.norm(self.position)
        return -0.01 * distance_to_origin  # Small penalty for distance

    def check_collision(self):
        """Check for collisions with obstacles"""
        for obs in self.obstacles:
            if np.linalg.norm(self.position - obs) < 0.5:  # 0.5m collision threshold
                return True
        return False

# Example usage
def run_navigation_example():
    model = NavigationVLA()
    agent = NavigationAgent(model)
    env = NavigationEnvironment()

    instruction = "navigate to the red object"

    print("Starting navigation example...")
    for step in range(100):
        current_image, current_state, reward, done = env.step(0)  # Start with forward

        if done:
            print(f"Episode finished at step {step}")
            break

        action, value = agent.get_action(current_image, instruction, current_state)
        print(f"Step {step}: Action={action}, Value={value:.3f}")

        current_image, current_state, reward, done = env.step(action)

        if step % 10 == 0:
            print(f"Position: [{env.position[0]:.2f}, {env.position[1]:.2f}], Orientation: {env.orientation:.2f}")

    print("Navigation example completed")
```

## Multi-Step Task Implementation

### Sequential Task Execution with VLA

```python
# sequential_task_vla.py
import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict, Any
import re

class SequentialVLAModel(nn.Module):
    def __init__(self, max_steps=10):
        super(SequentialVLAModel, self).__init__()

        self.max_steps = max_steps

        # Encoders
        self.vision_encoder = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Flatten(),
            nn.Linear(128 * 30 * 40, 512)  # Assuming input is 120x160
        )

        self.language_encoder = nn.LSTM(300, 256, batch_first=True)  # Word embeddings
        self.task_planner = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=512, nhead=8),
            num_layers=3
        )

        # Action heads
        self.action_classifier = nn.Linear(512, 20)  # 20 different primitive actions
        self.subtask_generator = nn.Linear(512, max_steps)  # Which subtask to execute

    def forward(self, images, instruction_embeddings, step_embeddings):
        # Encode vision
        vision_features = self.vision_encoder(images)

        # Encode language
        lang_features, _ = self.language_encoder(instruction_embeddings)
        lang_features = lang_features[:, -1, :]  # Take last hidden state

        # Combine vision and language
        combined_features = vision_features + lang_features

        # Add step information
        step_features = step_embeddings + combined_features

        # Plan subtasks
        subtask_probs = torch.softmax(self.subtask_generator(step_features), dim=-1)

        # Generate action
        action_logits = self.action_classifier(step_features)

        return action_logits, subtask_probs

class SequentialTaskExecutor:
    def __init__(self, model):
        self.model = model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        # Define primitive actions
        self.primitive_actions = [
            'move_forward', 'turn_left', 'turn_right', 'stop',
            'grasp', 'release', 'lift', 'lower',
            'open_gripper', 'close_gripper', 'rotate_wrist',
            'approach_object', 'retract', 'align_to_object',
            'navigate_to', 'wait', 'check_object', 'move_to_pose',
            'detect_object', 'track_object'
        ]

        # Task decomposition rules
        self.task_rules = {
            r'pick.*and.*place': ['navigate_to_object', 'grasp_object', 'navigate_to_target', 'place_object'],
            r'go.*to.*(table|kitchen|bedroom)': ['navigate_to_location'],
            r'bring.*to.*me': ['find_object', 'grasp_object', 'navigate_to_human', 'release_object'],
            r'clean.*up': ['detect_dirty_items', 'grasp_item', 'navigate_to_bin', 'release_item']
        }

    def decompose_task(self, instruction: str) -> List[str]:
        """Decompose high-level instruction into subtasks"""
        instruction_lower = instruction.lower()

        for pattern, subtasks in self.task_rules.items():
            if re.search(pattern, instruction_lower):
                return subtasks

        # Default: single subtask
        return ['execute_instruction']

    def execute_sequential_task(self, image, instruction, max_steps=10):
        """
        Execute a sequential task with multiple subtasks
        """
        # Decompose task into subtasks
        subtasks = self.decompose_task(instruction)
        print(f"Decomposed '{instruction}' into subtasks: {subtasks}")

        results = []

        for step_idx, subtask in enumerate(subtasks[:max_steps]):
            print(f"Executing subtask {step_idx + 1}: {subtask}")

            # Create step embedding
            step_embedding = torch.tensor([step_idx / max_steps], dtype=torch.float32).unsqueeze(0).to(self.device)

            # Preprocess inputs
            image_tensor = self.preprocess_image(image).to(self.device)
            instruction_tensor = self.encode_instruction(instruction).to(self.device)

            with torch.no_grad():
                action_logits, subtask_probs = self.model(
                    image_tensor, instruction_tensor, step_embedding
                )

                # Get predicted action
                action_idx = torch.argmax(action_logits, dim=-1).item()
                predicted_action = self.primitive_actions[action_idx] if action_idx < len(self.primitive_actions) else 'unknown'

                # Get subtask probability
                subtask_prob = subtask_probs[0][step_idx].item() if step_idx < subtask_probs.shape[1] else 0.0

            result = {
                'step': step_idx,
                'subtask': subtask,
                'predicted_action': predicted_action,
                'action_confidence': torch.softmax(action_logits, dim=-1)[0][action_idx].item(),
                'subtask_probability': subtask_prob
            }

            results.append(result)
            print(f"  → Action: {predicted_action} (confidence: {result['action_confidence']:.3f})")

            # Simulate action execution
            # In real implementation, this would interface with the robot
            simulated_image = self.simulate_action_effect(image, predicted_action)

            # Check if subtask is complete (simplified)
            if self.is_subtask_complete(subtask, predicted_action):
                print(f"  → Subtask '{subtask}' completed")
            else:
                print(f"  → Subtask '{subtask}' continuing...")

        return results

    def preprocess_image(self, image):
        """Preprocess image for the model"""
        image = cv2.resize(image, (120, 160))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        return torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    def encode_instruction(self, instruction):
        """Encode instruction using word embeddings"""
        # Simplified word embedding (in practice, use pre-trained embeddings)
        words = instruction.lower().split()
        embeddings = []

        for word in words:
            # Create simple hash-based embedding
            emb = np.zeros(300)
            for i, char in enumerate(word[:10]):  # First 10 characters
                emb[i * 30:(i+1) * 30] = ord(char) / 255.0
            embeddings.append(emb)

        if len(embeddings) == 0:
            embeddings = [np.zeros(300)]

        return torch.tensor(np.array(embeddings), dtype=torch.float32).unsqueeze(0)

    def simulate_action_effect(self, image, action):
        """Simulate the effect of an action on the image"""
        # This is a placeholder - in reality, this would be the new image after action
        # For simulation, just return the same image
        return image

    def is_subtask_complete(self, subtask, action):
        """Check if a subtask is complete based on the action taken"""
        completion_map = {
            'navigate_to_object': ['approach_object', 'align_to_object'],
            'grasp_object': ['grasp', 'close_gripper'],
            'navigate_to_target': ['navigate_to'],
            'place_object': ['release', 'open_gripper'],
            'navigate_to_location': ['navigate_to']
        }

        if subtask in completion_map:
            return action in completion_map[subtask]

        return False  # Default: not complete

# Example usage
def run_sequential_task_example():
    model = SequentialVLAModel()
    executor = SequentialTaskExecutor(model)

    # Test various instructions
    test_instructions = [
        "Pick up the red cup and place it on the table",
        "Go to the kitchen and bring me a water bottle",
        "Clean up the toys from the floor"
    ]

    for instruction in test_instructions:
        print(f"\nExecuting: '{instruction}'")
        dummy_image = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)

        results = executor.execute_sequential_task(dummy_image, instruction)

        print(f"Task execution completed with {len(results)} steps")
        total_confidence = sum(r['action_confidence'] for r in results)
        avg_confidence = total_confidence / len(results) if results else 0
        print(f"Average action confidence: {avg_confidence:.3f}")
```

## Real-time VLA Inference System

### Optimized Inference Pipeline

```python
# optimized_vla_inference.py
import torch
import torch.nn as nn
import numpy as np
import cv2
import time
from collections import deque
import threading
import queue

class OptimizedVLAModel(nn.Module):
    def __init__(self):
        super(OptimizedVLAModel, self).__init__()

        # Optimized vision encoder using depthwise separable convolutions
        self.vision_encoder = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 32, 3, padding=1, groups=32),  # Depthwise conv
            nn.Conv2d(32, 64, 1),  # Pointwise conv
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((8, 8)),  # Global average pooling instead of flatten
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 256),
            nn.ReLU()
        )

        # Lightweight language encoder
        self.language_encoder = nn.Sequential(
            nn.Linear(384, 256),  # Smaller embedding size
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU()
        )

        # Efficient fusion
        self.fusion = nn.Sequential(
            nn.Linear(256 + 256, 512),  # vision + language
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, 256),
            nn.ReLU()
        )

        # Action output
        self.action_head = nn.Linear(256, 7)  # 7-DOF robot action

    def forward(self, images, instructions):
        vision_features = self.vision_encoder(images)
        language_features = self.language_encoder(instructions)

        combined = torch.cat([vision_features, language_features], dim=-1)
        fused = self.fusion(combined)

        action = self.action_head(fused)
        return action

class RealTimeVLAInference:
    def __init__(self, model_path=None, target_fps=30):
        self.model = OptimizedVLAModel()

        if model_path:
            self.model.load_state_dict(torch.load(model_path, map_location='cpu'))

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        # Optimization: Use TorchScript for faster inference
        self.model = torch.jit.script(self.model)

        self.target_fps = target_fps
        self.frame_interval = 1.0 / target_fps

        # Input queues for multi-threading
        self.image_queue = queue.Queue(maxsize=2)
        self.instruction_queue = queue.Queue(maxsize=10)
        self.result_queue = queue.Queue(maxsize=2)

        # Threading
        self.inference_thread = threading.Thread(target=self.inference_worker, daemon=True)
        self.inference_thread.start()

        # Performance monitoring
        self.frame_times = deque(maxlen=30)  # Last 30 frame times
        self.last_inference_time = time.time()

    def preprocess_image(self, image):
        """Optimized image preprocessing"""
        # Resize to smaller size for faster processing
        image = cv2.resize(image, (160, 120))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        return torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    def encode_instruction(self, instruction):
        """Optimized instruction encoding"""
        # Use a simple but fast encoding method
        # In practice, you might use a pre-computed embedding or a lightweight encoder
        encoding = np.zeros(384, dtype=np.float32)

        # Simple character-based encoding
        for i, char in enumerate(instruction.lower()[:100]):  # Limit length
            if i < len(encoding):
                encoding[i] = ord(char) / 255.0

        return torch.tensor(encoding, dtype=torch.float32).unsqueeze(0)

    def inference_worker(self):
        """Background inference worker"""
        while True:
            try:
                # Wait for image and instruction
                image, instruction = self.image_queue.get(timeout=1.0)

                start_time = time.time()

                # Preprocess inputs
                image_tensor = self.preprocess_image(image).to(self.device)
                instruction_tensor = self.encode_instruction(instruction).to(self.device)

                # Run inference
                with torch.no_grad():
                    action = self.model(image_tensor, instruction_tensor)

                inference_time = time.time() - start_time
                self.frame_times.append(inference_time)

                # Put result in queue
                if not self.result_queue.full():
                    self.result_queue.put({
                        'action': action.cpu().numpy(),
                        'inference_time': inference_time,
                        'timestamp': time.time()
                    })

                # Maintain target frame rate
                sleep_time = self.frame_interval - inference_time
                if sleep_time > 0:
                    time.sleep(sleep_time)

            except queue.Empty:
                continue
            except Exception as e:
                print(f"Inference worker error: {e}")
                time.sleep(0.1)  # Brief pause before continuing

    def submit_inference_request(self, image, instruction):
        """Submit an inference request"""
        try:
            if not self.image_queue.full():
                self.image_queue.put((image, instruction))
                return True
        except:
            pass
        return False

    def get_latest_result(self):
        """Get the most recent inference result"""
        results = []
        while not self.result_queue.empty():
            results.append(self.result_queue.get())

        return results[-1] if results else None

    def get_performance_stats(self):
        """Get performance statistics"""
        if not self.frame_times:
            return {'avg_fps': 0, 'avg_inference_time': 0}

        avg_frame_time = sum(self.frame_times) / len(self.frame_times)
        avg_fps = 1.0 / avg_frame_time if avg_frame_time > 0 else 0

        return {
            'avg_fps': avg_fps,
            'avg_inference_time': avg_frame_time * 1000,  # ms
            'queue_size': self.image_queue.qsize()
        }

# Example usage
def run_real_time_example():
    inference_system = RealTimeVLAInference()

    print("Starting real-time VLA inference example...")

    for i in range(100):  # Simulate 100 frames
        # Simulate camera input
        dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        instruction = "move forward" if i % 2 == 0 else "turn left"

        # Submit inference request
        success = inference_system.submit_inference_request(dummy_image, instruction)

        if success:
            # Get result
            result = inference_system.get_latest_result()
            if result:
                action = result['action']
                print(f"Frame {i}: Action={action.flatten()[:3]}... (first 3 dims)")

        # Show performance stats periodically
        if i % 30 == 0:
            stats = inference_system.get_performance_stats()
            print(f"Performance: {stats['avg_fps']:.1f} FPS, "
                  f"{stats['avg_inference_time']:.1f}ms per inference")

    print("Real-time example completed")
```

## Integration with ROS

### ROS Node Implementation

```python
# vla_ros_node.py
#!/usr/bin/env python3
import rospy
import torch
import numpy as np
import cv2
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import String, Float32MultiArray
from geometry_msgs.msg import Twist
from cv_bridge import CvBridge
from typing import Dict, Any

class VLAROSNode:
    def __init__(self):
        rospy.init_node('vla_ros_node')

        # Initialize VLA model
        self.model = self.load_model()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        # ROS interfaces
        self.bridge = CvBridge()

        # Publishers
        self.action_pub = rospy.Publisher('/vla/action', Float32MultiArray, queue_size=10)
        self.status_pub = rospy.Publisher('/vla/status', String, queue_size=10)

        # Subscribers
        self.image_sub = rospy.Subscriber('/camera/rgb/image_raw', Image, self.image_callback)
        self.instruction_sub = rospy.Subscriber('/vla/instruction', String, self.instruction_callback)

        # Internal state
        self.current_image = None
        self.current_instruction = None
        self.last_inference_time = rospy.Time.now()

        # Parameters
        self.inference_rate = rospy.get_param('~inference_rate', 10.0)  # Hz
        self.image_topic = rospy.get_param('~image_topic', '/camera/rgb/image_raw')
        self.instruction_topic = rospy.get_param('~instruction_topic', '/vla/instruction')

        rospy.loginfo(f"VLA ROS Node initialized with rate {self.inference_rate}Hz")

    def load_model(self):
        """Load the trained VLA model"""
        # In practice, load your specific model architecture and weights
        model = OptimizedVLAModel()  # Using the model from previous example

        # Load weights if available
        model_path = rospy.get_param('~model_path', '')
        if model_path and os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            rospy.loginfo(f"Loaded model from {model_path}")
        else:
            rospy.logwarn("No model file specified, using random weights")

        return model

    def image_callback(self, msg):
        """Process incoming image"""
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            self.current_image = cv_image
        except Exception as e:
            rospy.logerr(f"Image conversion error: {e}")

    def instruction_callback(self, msg):
        """Process incoming instruction"""
        self.current_instruction = msg.data
        rospy.loginfo(f"Received instruction: {msg.data}")

    def run_inference(self):
        """Run VLA inference if we have both image and instruction"""
        if self.current_image is None or self.current_instruction is None:
            return

        try:
            # Preprocess image
            image_tensor = self.preprocess_image(self.current_image).to(self.device)
            instruction_tensor = self.encode_instruction(self.current_instruction).to(self.device)

            # Run inference
            with torch.no_grad():
                action = self.model(image_tensor, instruction_tensor)

            # Publish action
            action_msg = Float32MultiArray()
            action_msg.data = action.cpu().numpy().flatten().tolist()
            self.action_pub.publish(action_msg)

            # Publish status
            status_msg = String()
            status_msg.data = f"Action published: {action_msg.data[:3]}..."
            self.status_pub.publish(status_msg)

            rospy.loginfo_throttle(1.0, f"Published VLA action: {action_msg.data[:3]}...")

        except Exception as e:
            rospy.logerr(f"VLA inference error: {e}")

    def preprocess_image(self, image):
        """Preprocess image for the model"""
        image = cv2.resize(image, (160, 120))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        return torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    def encode_instruction(self, instruction):
        """Encode instruction for the model"""
        encoding = np.zeros(384, dtype=np.float32)
        for i, char in enumerate(instruction.lower()[:384]):
            encoding[i] = ord(char) / 255.0
        return torch.tensor(encoding, dtype=torch.float32).unsqueeze(0)

    def spin(self):
        """Main loop"""
        rate = rospy.Rate(self.inference_rate)

        while not rospy.is_shutdown():
            self.run_inference()
            rate.sleep()

def main():
    node = VLAROSNode()
    try:
        node.spin()
    except rospy.ROSInterruptException:
        rospy.loginfo("VLA ROS Node terminated")

if __name__ == '__main__':
    main()
```

## Best Practices for VLA Implementation

### 1. Performance Optimization
- Use model quantization for edge deployment
- Implement efficient preprocessing pipelines
- Use multi-threading for data loading
- Profile and optimize bottlenecks

### 2. Safety Considerations
- Implement action space constraints
- Add safety validation layers
- Use confidence thresholds
- Plan for graceful degradation

### 3. Robustness
- Handle missing modalities gracefully
- Implement fallback behaviors
- Validate input quality
- Monitor for distribution shift

### 4. Scalability
- Design modular architectures
- Use efficient data structures
- Implement caching where appropriate
- Consider distributed inference

## Troubleshooting Implementation Issues

### Common Problems and Solutions

1. **Memory Issues**
   - Use smaller model variants
   - Implement gradient checkpointing
   - Optimize batch processing
   - Use mixed precision training

2. **Performance Bottlenecks**
   - Profile code to identify bottlenecks
   - Use TorchScript for optimization
   - Implement efficient data loading
   - Consider model pruning

3. **Integration Problems**
   - Verify data format compatibility
   - Check coordinate system consistency
   - Validate timing requirements
   - Test in simulation first

## Summary

In this chapter, we've explored comprehensive VLA implementation examples:

- Complete end-to-end VLA system architecture
- Manipulation task implementation (pick and place)
- Navigation task implementation
- Multi-step sequential task execution
- Real-time inference pipeline
- ROS integration

These examples provide practical foundations for implementing VLA systems in real robotics applications. Each implementation demonstrates different aspects of VLA development, from basic architecture to real-time performance considerations.

In the next chapter, we'll explore future directions and emerging trends in VLA research and applications.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about VLA implementations or need help with creating your own VLA system!