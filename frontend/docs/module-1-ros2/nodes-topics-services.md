---
sidebar_position: 2
title: "Nodes, Topics, and Services in ROS 2"
description: "Deep dive into the core communication patterns in Robot Operating System 2"
keywords: ["ROS 2", "nodes", "topics", "services", "communication", "robotics"]
---

# Nodes, Topics, and Services in ROS 2

## Understanding ROS 2 Communication Patterns

ROS 2 implements a distributed computing framework where different processes (nodes) communicate with each other through various mechanisms. The three primary communication patterns are:

1. **Nodes**: The fundamental execution units that perform computations
2. **Topics**: Asynchronous publish/subscribe communication
3. **Services**: Synchronous request/reply communication

## Nodes in Depth

### What Are Nodes?

A node is an executable that uses ROS 2 to communicate with other nodes. Nodes are the building blocks of a ROS 2 system, and each node typically performs a specific task within the larger robotic system.

### Node Lifecycle

Nodes in ROS 2 follow a specific lifecycle:

```python
import rclpy
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn

class MyLifecycleNode(LifecycleNode):
    def __init__(self):
        super().__init__('my_lifecycle_node')

    def on_configure(self, state):
        self.get_logger().info('Configuring node...')
        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        self.get_logger().info('Activating node...')
        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state):
        self.get_logger().info('Deactivating node...')
        return TransitionCallbackReturn.SUCCESS
```

### Node Parameters

Nodes can accept parameters that can be configured at runtime:

```python
from rcl_interfaces.msg import ParameterType

class ParameterizedNode(rclpy.Node):
    def __init__(self):
        super().__init__('parameterized_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'turtlebot')
        self.declare_parameter('max_velocity', 1.0)

        # Get parameter values
        robot_name = self.get_parameter('robot_name').get_parameter_value().string_value
        max_vel = self.get_parameter('max_velocity').get_parameter_value().double_value
```

## Topics and Publishers/Subscribers

### Topic Communication Model

Topics implement a publish/subscribe pattern where publishers send messages to topics and subscribers receive messages from topics. This is asynchronous communication that decouples publishers from subscribers.

### Creating Publishers

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Int32
from geometry_msgs.msg import Twist
import time

class VelocityPublisher(Node):
    def __init__(self):
        super().__init__('velocity_publisher')

        # Create publisher
        self.publisher = self.create_publisher(
            Twist,           # Message type
            'cmd_vel',       # Topic name
            10              # Queue size
        )

        # Timer to publish messages periodically
        self.timer = self.create_timer(0.1, self.publish_velocity)
        self.i = 0

    def publish_velocity(self):
        msg = Twist()
        msg.linear.x = 1.0  # Forward velocity
        msg.angular.z = 0.5  # Angular velocity

        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: linear={msg.linear.x}, angular={msg.angular.z}')
        self.i += 1
```

### Creating Subscribers

```python
class SensorSubscriber(Node):
    def __init__(self):
        super().__init__('sensor_subscriber')

        # Create subscriber
        self.subscription = self.create_subscription(
            String,          # Message type
            'sensor_data',   # Topic name
            self.listener_callback,  # Callback function
            10               # Queue size
        )
        self.subscription  # Prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'Received sensor data: {msg.data}')
```

### Quality of Service (QoS) Settings

QoS profiles allow fine-tuning of communication behavior:

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

# Configure QoS for reliable communication
qos_profile = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE
)

publisher = node.create_publisher(String, 'topic', qos_profile)
```

## Services in ROS 2

### Service Communication Model

Services implement a synchronous request/reply pattern. A service client sends a request to a service server, and the server responds with a result. This is blocking communication.

### Creating Services

```python
# Server implementation
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddTwoIntsService(Node):
    def __init__(self):
        super().__init__('add_two_ints_service')

        # Create service
        self.service = self.create_service(
            AddTwoInts,                    # Service type
            'add_two_ints',               # Service name
            self.add_two_ints_callback    # Callback function
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning: {request.a} + {request.b} = {response.sum}')
        return response

# Client implementation
class AddTwoIntsClient(Node):
    def __init__(self):
        super().__init__('add_two_ints_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')

        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')

        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()
```

## Advanced Communication Patterns

### Using Actions for Long-Running Tasks

Actions combine the benefits of topics and services for long-running operations with feedback:

```python
from rclpy.action import ActionClient
from rclpy.callback_groups import ReentrantCallbackGroup
from nav2_msgs.action import NavigateToPose

class NavigationClient(Node):
    def __init__(self):
        super().__init__('navigation_client')
        self._action_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )

    def send_goal(self, pose):
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose = pose

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def feedback_callback(self, feedback_msg):
        self.get_logger().info(
            f'Current pose: ({feedback_msg.feedback.current_pose.position.x}, '
            f'{feedback_msg.feedback.current_pose.position.y})'
        )
```

## Practical Example: Sensor Fusion Node

Here's a practical example combining multiple communication patterns:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Imu
from geometry_msgs.msg import Twist
from std_srvs.srv import Trigger

class SensorFusionNode(Node):
    def __init__(self):
        super().__init__('sensor_fusion_node')

        # Publishers
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # Subscribers
        self.laser_sub = self.create_subscription(
            LaserScan, 'scan', self.laser_callback, 10)
        self.imu_sub = self.create_subscription(
            Imu, 'imu/data', self.imu_callback, 10)

        # Service server
        self.emergency_stop_srv = self.create_service(
            Trigger, 'emergency_stop', self.emergency_stop_callback)

        # Internal state
        self.obstacle_distance = float('inf')
        self.robot_orientation = 0.0

    def laser_callback(self, msg):
        # Find closest obstacle
        if len(msg.ranges) > 0:
            self.obstacle_distance = min(msg.ranges)
            self.get_logger().info(f'Closest obstacle: {self.obstacle_distance:.2f}m')

    def imu_callback(self, msg):
        # Extract orientation from IMU
        import math
        w = msg.orientation.w
        z = msg.orientation.z
        self.robot_orientation = math.atan2(2 * (w * z), 1 - 2 * (z * z))

    def emergency_stop_callback(self, request, response):
        # Stop the robot immediately
        stop_msg = Twist()
        self.cmd_pub.publish(stop_msg)
        response.success = True
        response.message = 'Emergency stop executed'
        return response
```

## Best Practices for Communication

### 1. Topic Naming Conventions

- Use forward slashes to separate namespaces: `/robot1/sensors/laser_scan`
- Use lowercase with underscores: `joint_states`, `cmd_vel`
- Avoid special characters except underscores and forward slashes

### 2. Message Design

- Keep messages lightweight for high-frequency topics
- Use appropriate data types (float32 vs float64)
- Consider bandwidth limitations for distributed systems

### 3. Error Handling

```python
def safe_publish(self, msg):
    try:
        self.publisher.publish(msg)
    except Exception as e:
        self.get_logger().error(f'Failed to publish message: {e}')
```

### 4. Resource Management

- Always destroy nodes properly
- Use appropriate queue sizes for publishers/subscribers
- Consider memory usage with large message types

## Troubleshooting Common Issues

### Topic Connection Problems

If nodes aren't communicating:
1. Check topic names match exactly
2. Verify nodes are on the same ROS domain
3. Ensure network configuration is correct for multi-machine setups

### Service Timeout Issues

For services timing out:
1. Verify service server is running
2. Check service name matches exactly
3. Increase timeout values if needed

## Summary

In this chapter, we've explored the fundamental communication patterns in ROS 2:
- **Nodes** as the basic computational units
- **Topics** for asynchronous publish/subscribe communication
- **Services** for synchronous request/reply communication
- **Actions** for long-running tasks with feedback

Understanding these patterns is crucial for building robust robotic systems with ROS 2. In the next chapter, we'll explore packages and workspaces in detail.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about any of these concepts or need clarification on ROS 2 communication patterns!