---
sidebar_position: 4
title: "Practical ROS 2 Examples"
description: "Hands-on examples demonstrating real-world ROS 2 applications"
keywords: ["ROS 2", "examples", "robotics", "practical", "tutorials", "applications"]
---

# Practical ROS 2 Examples

## Introduction

In this chapter, we'll explore practical examples that demonstrate real-world ROS 2 applications. These examples build upon the concepts covered in previous chapters and show how to implement complete robotic systems.

## Example 1: TurtleBot3 Navigation System

Let's create a complete navigation system for a simulated TurtleBot3 robot:

### Robot Control Node

```python
# turtlebot3_controller/turtlebot3_controller.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import Odometry
import math

class TurtleBot3Controller(Node):
    def __init__(self):
        super().__init__('turtlebot3_controller')

        # Publishers and subscribers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, 'scan', self.scan_callback, 10)
        self.odom_sub = self.create_subscription(Odometry, 'odom', self.odom_callback, 10)

        # Parameters
        self.declare_parameter('linear_speed', 0.2)
        self.declare_parameter('angular_speed', 0.5)
        self.declare_parameter('safety_distance', 0.5)

        # Robot state
        self.current_pose = None
        self.closest_obstacle = float('inf')

        # Control timer
        self.control_timer = self.create_timer(0.1, self.control_loop)

        self.get_logger().info('TurtleBot3 Controller initialized')

    def odom_callback(self, msg):
        self.current_pose = msg.pose.pose

    def scan_callback(self, msg):
        if len(msg.ranges) > 0:
            # Filter out invalid ranges
            valid_ranges = [r for r in msg.ranges if 0.1 < r < 10.0]
            if valid_ranges:
                self.closest_obstacle = min(valid_ranges)

    def control_loop(self):
        cmd_msg = Twist()

        # Simple obstacle avoidance
        if self.closest_obstacle > self.get_parameter('safety_distance').get_parameter_value().double_value:
            # Move forward
            cmd_msg.linear.x = self.get_parameter('linear_speed').get_parameter_value().double_value
            cmd_msg.angular.z = 0.0
        else:
            # Turn away from obstacle
            cmd_msg.linear.x = 0.0
            cmd_msg.angular.z = self.get_parameter('angular_speed').get_parameter_value().double_value

        self.cmd_vel_pub.publish(cmd_msg)

def main(args=None):
    rclpy.init(args=args)
    controller = TurtleBot3Controller()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Waypoint Navigation Node

```python
# turtlebot3_controller/waypoint_navigation.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, Pose
from nav_msgs.msg import Odometry
from std_msgs.msg import Bool
import math

class WaypointNavigator(Node):
    def __init__(self):
        super().__init__('waypoint_navigator')

        # Publishers and subscribers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.odom_sub = self.create_subscription(Odometry, 'odom', self.odom_callback, 10)

        # Waypoints (x, y, theta)
        self.waypoints = [
            (1.0, 0.0, 0.0),
            (1.0, 1.0, 1.57),
            (0.0, 1.0, 3.14),
            (0.0, 0.0, -1.57)
        ]
        self.current_waypoint_index = 0

        # Robot state
        self.current_pose = Pose()

        # Control timer
        self.navigation_timer = self.create_timer(0.1, self.navigation_loop)

        self.get_logger().info(f'Waypoint navigator initialized with {len(self.waypoints)} waypoints')

    def odom_callback(self, msg):
        self.current_pose = msg.pose.pose

    def calculate_distance(self, pose1, pose2):
        return math.sqrt((pose2.position.x - pose1.position.x)**2 +
                         (pose2.position.y - pose1.position.y)**2)

    def calculate_angle(self, pose1, pose2):
        return math.atan2(pose2.position.y - pose1.position.y,
                         pose2.position.x - pose1.position.x)

    def navigation_loop(self):
        if self.current_waypoint_index >= len(self.waypoints):
            # All waypoints reached
            cmd_msg = Twist()
            self.cmd_vel_pub.publish(cmd_msg)
            return

        target_x, target_y, target_theta = self.waypoints[self.current_waypoint_index]

        # Calculate current position
        current_x = self.current_pose.position.x
        current_y = self.current_pose.position.y

        # Calculate distance to target
        distance = math.sqrt((target_x - current_x)**2 + (target_y - current_y)**2)

        cmd_msg = Twist()

        if distance > 0.1:  # Not close enough to target
            # Calculate target angle
            target_angle = math.atan2(target_y - current_y, target_x - current_x)

            # Calculate current angle (simplified - assuming orientation in pose.orientation)
            from tf_transformations import euler_from_quaternion
            _, _, current_yaw = euler_from_quaternion([
                self.current_pose.orientation.x,
                self.current_pose.orientation.y,
                self.current_pose.orientation.z,
                self.current_pose.orientation.w
            ])

            # Angular control
            angle_diff = target_angle - current_yaw
            if angle_diff > math.pi:
                angle_diff -= 2 * math.pi
            elif angle_diff < -math.pi:
                angle_diff += 2 * math.pi

            cmd_msg.angular.z = max(-1.0, min(1.0, angle_diff * 1.5))

            # Linear control (only when roughly aligned)
            if abs(angle_diff) < 0.2:
                cmd_msg.linear.x = min(0.5, distance * 2.0)
        else:
            # Close enough to target, move to next waypoint
            self.current_waypoint_index += 1
            cmd_msg.linear.x = 0.0
            cmd_msg.angular.z = 0.0

            if self.current_waypoint_index < len(self.waypoints):
                self.get_logger().info(f'Moving to waypoint {self.current_waypoint_index + 1}')

        self.cmd_vel_pub.publish(cmd_msg)

def main(args=None):
    rclpy.init(args=args)
    navigator = WaypointNavigator()
    rclpy.spin(navigator)
    navigator.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 2: Multi-Robot Coordination

Let's implement a multi-robot coordination system:

### Robot Coordinator Node

```python
# multi_robot_coordinator/robot_coordinator.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, Pose
from std_msgs.msg import String, Int32
from sensor_msgs.msg import LaserScan
import json

class RobotCoordinator(Node):
    def __init__(self):
        super().__init__('robot_coordinator')

        # Robot ID parameter
        self.declare_parameter('robot_id', 'robot1')
        self.robot_id = self.get_parameter('robot_id').get_parameter_value().string_value

        # Publishers for own robot
        self.cmd_pub = self.create_publisher(Twist, f'/{self.robot_id}/cmd_vel', 10)

        # Publishers for inter-robot communication
        self.status_pub = self.create_publisher(String, '/coordination/status', 10)
        self.task_pub = self.create_publisher(String, '/coordination/tasks', 10)

        # Subscribers for other robots
        self.status_sub = self.create_subscription(
            String, '/coordination/status', self.status_callback, 10)

        # Robot states
        self.robot_states = {}
        self.current_task = None

        # Timer for coordination
        self.coordination_timer = self.create_timer(1.0, self.coordination_loop)

        self.get_logger().info(f'Robot coordinator {self.robot_id} initialized')

    def status_callback(self, msg):
        try:
            status_data = json.loads(msg.data)
            robot_id = status_data.get('robot_id')
            if robot_id:
                self.robot_states[robot_id] = status_data
        except json.JSONDecodeError:
            pass

    def coordination_loop(self):
        # Create status message
        status_msg = String()
        status_data = {
            'robot_id': self.robot_id,
            'position': {'x': 0.0, 'y': 0.0},  # Would come from odometry
            'status': 'active',
            'battery': 100,
            'task': self.current_task
        }
        status_msg.data = json.dumps(status_data)
        self.status_pub.publish(status_msg)

        # Simple task assignment logic
        if not self.current_task:
            self.assign_task()

    def assign_task(self):
        # Simple load balancing based on number of active robots
        active_robots = [r for r, s in self.robot_states.items()
                        if s.get('status') == 'active' and s.get('robot_id') != self.robot_id]

        if len(active_robots) % 2 == 0:  # Simple alternating assignment
            task_msg = String()
            task_msg.data = json.dumps({
                'robot_id': self.robot_id,
                'task': 'exploration',
                'area': f'area_{len(active_robots) // 2}'
            })
            self.task_pub.publish(task_msg)
            self.current_task = 'exploration'

def main(args=None):
    rclpy.init(args=args)
    coordinator = RobotCoordinator()
    rclpy.spin(coordinator)
    coordinator.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 3: Perception Pipeline

Let's create a perception pipeline that processes sensor data:

### Object Detection Node

```python
# perception_pipeline/object_detector.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, LaserScan
from std_msgs.msg import String
from geometry_msgs.msg import Point
from cv_bridge import CvBridge
import cv2
import numpy as np

class ObjectDetector(Node):
    def __init__(self):
        super().__init__('object_detector')

        # Publishers
        self.detection_pub = self.create_publisher(String, 'object_detections', 10)

        # Subscribers
        self.image_sub = self.create_subscription(Image, 'camera/image_raw', self.image_callback, 10)
        self.scan_sub = self.create_subscription(LaserScan, 'scan', self.scan_callback, 10)

        # CV Bridge for image processing
        self.bridge = CvBridge()

        # Detection parameters
        self.declare_parameter('detection_threshold', 0.5)
        self.declare_parameter('min_object_size', 30)

        self.get_logger().info('Object detector initialized')

    def image_callback(self, msg):
        try:
            # Convert ROS image to OpenCV
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Simple color-based detection (example: red objects)
            hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)

            # Define range for red color
            lower_red = np.array([0, 50, 50])
            upper_red = np.array([10, 255, 255])
            mask1 = cv2.inRange(hsv, lower_red, upper_red)

            lower_red = np.array([170, 50, 50])
            upper_red = np.array([180, 255, 255])
            mask2 = cv2.inRange(hsv, lower_red, upper_red)

            mask = mask1 + mask2

            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            detections = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > self.get_parameter('min_object_size').get_parameter_value().integer_value:
                    # Calculate centroid
                    M = cv2.moments(contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])

                        # Convert to relative position (normalized coordinates)
                        height, width = cv_image.shape[:2]
                        rel_x = (cx - width/2) / (width/2)  # -1 to 1
                        rel_y = (cy - height/2) / (height/2)  # -1 to 1

                        detection = {
                            'type': 'red_object',
                            'relative_position': {'x': rel_x, 'y': rel_y},
                            'confidence': 0.8,  # Fixed for example
                            'area': area
                        }
                        detections.append(detection)

            # Publish detections
            if detections:
                detection_msg = String()
                detection_msg.data = str(detections)
                self.detection_pub.publish(detection_msg)

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')

    def scan_callback(self, msg):
        # Process laser scan for object detection
        # Find clusters of points that might represent objects
        ranges = np.array(msg.ranges)

        # Remove invalid ranges
        valid_ranges = np.where((ranges > msg.range_min) & (ranges < msg.range_max))[0]

        if len(valid_ranges) > 0:
            # Simple clustering of nearby points
            objects = self.cluster_scan_points(ranges, msg.angle_min, msg.angle_increment, valid_ranges)

            if objects:
                detection_msg = String()
                detection_msg.data = str(objects)
                self.detection_pub.publish(detection_msg)

    def cluster_scan_points(self, ranges, angle_min, angle_increment, valid_indices):
        objects = []
        current_cluster = []

        for i in valid_indices:
            angle = angle_min + i * angle_increment
            distance = ranges[i]
            x = distance * np.cos(angle)
            y = distance * np.sin(angle)

            current_cluster.append((x, y))

            # If cluster is large enough or we have a gap, finalize cluster
            if len(current_cluster) > 5:  # At least 5 points
                # Calculate centroid
                centroid_x = np.mean([p[0] for p in current_cluster])
                centroid_y = np.mean([p[1] for p in current_cluster])

                objects.append({
                    'type': 'laser_object',
                    'position': {'x': float(centroid_x), 'y': float(centroid_y)},
                    'size': len(current_cluster)
                })

                current_cluster = []

        return objects

def main(args=None):
    rclpy.init(args=args)
    detector = ObjectDetector()
    rclpy.spin(detector)
    detector.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Example 4: Behavior Trees for Robot Control

Let's implement a behavior tree system for complex robot behaviors:

### Behavior Tree Node

```python
# behavior_tree/behavior_tree.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool, Float32
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import time

class BehaviorNode:
    def __init__(self, name):
        self.name = name
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def tick(self):
        raise NotImplementedError

class ActionNode(BehaviorNode):
    def __init__(self, name, action_func):
        super().__init__(name)
        self.action_func = action_func

    def tick(self):
        return self.action_func()

class ConditionNode(BehaviorNode):
    def __init__(self, name, condition_func):
        super().__init__(name)
        self.condition_func = condition_func

    def tick(self):
        return self.condition_func()

class SequenceNode(BehaviorNode):
    def tick(self):
        for child in self.children:
            status = child.tick()
            if status == 'FAILURE':
                return 'FAILURE'
        return 'SUCCESS'

class SelectorNode(BehaviorNode):
    def tick(self):
        for child in self.children:
            status = child.tick()
            if status == 'SUCCESS':
                return 'SUCCESS'
        return 'FAILURE'

class RobotBehaviorTree(Node):
    def __init__(self):
        super().__init__('robot_behavior_tree')

        # Publishers and subscribers
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, 'scan', self.scan_callback, 10)

        # Robot state
        self.closest_obstacle = float('inf')
        self.moving_forward = True

        # Create behavior tree
        self.create_behavior_tree()

        # Control timer
        self.control_timer = self.create_timer(0.1, self.control_loop)

        self.get_logger().info('Robot behavior tree initialized')

    def create_behavior_tree(self):
        # Root selector (try navigation, if that fails, try emergency behavior)
        root = SelectorNode('root')

        # Navigation sequence
        nav_sequence = SequenceNode('navigation')

        # Check if path is clear
        check_clear = ConditionNode('path_clear', self.is_path_clear)

        # Move forward
        move_forward = ActionNode('move_forward', self.move_forward_action)

        # Avoid obstacle
        avoid_obstacle = ActionNode('avoid_obstacle', self.avoid_obstacle_action)

        nav_sequence.add_child(check_clear)
        nav_sequence.add_child(move_forward)

        root.add_child(nav_sequence)
        root.add_child(avoid_obstacle)

        self.behavior_tree = root

    def scan_callback(self, msg):
        if len(msg.ranges) > 0:
            valid_ranges = [r for r in msg.ranges if 0.1 < r < 10.0]
            if valid_ranges:
                self.closest_obstacle = min(valid_ranges)

    def is_path_clear(self):
        return self.closest_obstacle > 0.8  # 0.8m safety distance

    def move_forward_action(self):
        cmd_msg = Twist()
        cmd_msg.linear.x = 0.3
        cmd_msg.angular.z = 0.0
        self.cmd_pub.publish(cmd_msg)
        return 'SUCCESS'

    def avoid_obstacle_action(self):
        cmd_msg = Twist()
        cmd_msg.linear.x = 0.0
        cmd_msg.angular.z = 0.5  # Turn to avoid
        self.cmd_pub.publish(cmd_msg)
        return 'SUCCESS'

    def control_loop(self):
        # Execute behavior tree
        result = self.behavior_tree.tick()
        self.get_logger().debug(f'Behavior tree result: {result}')

def main(args=None):
    rclpy.init(args=args)
    bt = RobotBehaviorTree()
    rclpy.spin(bt)
    bt.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Launch Files for Complete Systems

### Complete Navigation System Launch

```python
# launch/navigation_system.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    return LaunchDescription([
        # Robot controller
        Node(
            package='turtlebot3_controller',
            executable='turtlebot3_controller',
            name='turtlebot3_controller',
            parameters=[
                {'linear_speed': 0.2},
                {'angular_speed': 0.5},
                {'safety_distance': 0.5}
            ],
            remappings=[
                ('/cmd_vel', '/cmd_vel'),
                ('/scan', '/scan'),
                ('/odom', '/odom')
            ]
        ),

        # Waypoint navigator
        Node(
            package='turtlebot3_controller',
            executable='waypoint_navigation',
            name='waypoint_navigator',
            parameters=[
                {'waypoint_tolerance': 0.1}
            ]
        ),

        # Object detector
        Node(
            package='perception_pipeline',
            executable='object_detector',
            name='object_detector',
            parameters=[
                {'detection_threshold': 0.5},
                {'min_object_size': 30}
            ]
        ),

        # Behavior tree
        Node(
            package='behavior_tree',
            executable='behavior_tree',
            name='robot_behavior_tree'
        )
    ])
```

## Testing and Debugging

### Unit Tests for ROS 2 Nodes

```python
# test/test_robot_controller.py
import unittest
import rclpy
from rclpy.executors import SingleThreadedExecutor
from turtlebot3_controller.turtlebot3_controller import TurtleBot3Controller
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist

class TestTurtleBot3Controller(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        rclpy.init()

    @classmethod
    def tearDownClass(cls):
        rclpy.shutdown()

    def setUp(self):
        self.node = TurtleBot3Controller()
        self.executor = SingleThreadedExecutor()
        self.executor.add_node(self.node)

    def tearDown(self):
        self.node.destroy_node()

    def test_obstacle_detection(self):
        # Create a mock laser scan with an obstacle at 0.3m
        scan_msg = LaserScan()
        scan_msg.ranges = [0.3] * 360  # 360 degree scan with obstacle at 0.3m
        scan_msg.range_min = 0.1
        scan_msg.range_max = 10.0

        # Publish the scan message
        self.node.scan_callback(scan_msg)

        # Check that closest_obstacle was updated
        self.assertAlmostEqual(self.node.closest_obstacle, 0.3, places=1)

    def test_avoidance_behavior(self):
        # Set close obstacle
        self.node.closest_obstacle = 0.3

        # Call control loop
        self.node.control_loop()

        # Check that cmd_vel publisher was called with turning command
        # (This would require mocking the publisher to verify exact calls)

if __name__ == '__main__':
    unittest.main()
```

## Best Practices for Practical ROS 2 Development

### 1. Code Organization

- Separate concerns into different nodes
- Use appropriate data types and message structures
- Implement proper error handling
- Follow ROS 2 coding standards

### 2. Performance Optimization

- Use appropriate QoS profiles for different topics
- Optimize message sizes for high-frequency topics
- Use efficient algorithms for real-time processing
- Profile and optimize critical paths

### 3. Safety and Reliability

- Implement safety checks and emergency stops
- Use parameter validation
- Implement graceful degradation
- Add proper logging and monitoring

### 4. Testing and Validation

- Write unit tests for critical components
- Use simulation for testing before deployment
- Implement integration tests
- Validate with real hardware regularly

## Troubleshooting Common Issues

### Performance Issues

If experiencing performance problems:
1. Check CPU and memory usage
2. Optimize message publishing rates
3. Use appropriate QoS settings
4. Consider multi-threaded executors

### Communication Problems

For communication issues:
1. Verify network configuration
2. Check topic and service names
3. Ensure proper QoS profile matching
4. Verify ROS domain settings

## Summary

In this chapter, we've explored practical ROS 2 examples that demonstrate:
- Complete navigation systems with obstacle avoidance
- Multi-robot coordination systems
- Perception pipelines with sensor fusion
- Behavior trees for complex robot behaviors
- Launch files for system orchestration
- Testing and debugging strategies

These examples provide a foundation for building real-world robotic applications with ROS 2. Each example can be extended and customized for specific use cases.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about any of these concepts or need clarification on practical ROS 2 implementations!