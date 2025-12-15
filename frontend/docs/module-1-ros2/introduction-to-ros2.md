---
sidebar_position: 1
---

# Introduction to ROS 2

## What is ROS 2?

ROS 2 (Robot Operating System 2) is the next-generation middleware framework for robotics development. Unlike its predecessor, ROS 2 addresses many of the limitations of the original ROS, particularly in areas of real-time performance, security, and scalability.

### Key Improvements in ROS 2

1. **Real-time Support**: Better support for real-time applications
2. **Security**: Built-in security features for protected communication
3. **Multi-platform**: Improved support across different operating systems
4. **Professional Development**: More robust for production environments
5. **DDS Integration**: Uses Data Distribution Service for better communication

## Core Concepts

### Nodes
Nodes are the fundamental execution units in ROS 2. Each node is a process that performs computation and can communicate with other nodes.

```python
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
```

### Topics and Messages
Topics enable asynchronous communication between nodes through published messages. Messages are the data packets sent between nodes.

### Services
Services provide synchronous request/response communication patterns.

### Actions
Actions are for long-running tasks with feedback and goal management.

## Installation and Setup

### Prerequisites
- Ubuntu 20.04 or later (or Windows 10/11 with WSL2, or macOS)
- Python 3.8 or later
- At least 4GB of RAM recommended

### Installation Steps
1. Add the ROS 2 repository to your system
2. Install ROS 2 packages
3. Source the ROS 2 environment
4. Verify the installation

## Basic Architecture

### Client Libraries
ROS 2 provides client libraries for multiple languages:
- **rclcpp**: C++ client library
- **rclpy**: Python client library
- **rclrs**: Rust client library (experimental)

### DDS Implementations
ROS 2 uses DDS (Data Distribution Service) implementations:
- **Fast DDS**: Default in ROS 2 Humble Hawksbill
- **Cyclone DDS**: Lightweight alternative
- **RTI Connext DDS**: Commercial option

## Working with Packages

### Creating a Package
```bash
ros2 pkg create --build-type ament_python my_robot_package
```

### Building Packages
```bash
colcon build --packages-select my_robot_package
source install/setup.bash
```

## Practical Example: Robot Publisher/Subscriber

Let's create a simple publisher that sends robot position data:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class RobotPositionPublisher(Node):
    def __init__(self):
        super().__init__('robot_position_publisher')
        self.publisher_ = self.create_publisher(String, 'robot_position', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = f'Robot position: x=1.0, y=2.0, theta=0.5'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    robot_publisher = RobotPositionPublisher()
    rclpy.spin(robot_publisher)
    robot_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## ROS 2 Ecosystem

### Common Packages
- **rviz2**: 3D visualization tool
- **rqt**: GUI tools for introspection
- **ros2_control**: Robot control framework
- **navigation2**: Navigation stack
- **moveit2**: Motion planning framework

### Simulation Integration
ROS 2 works seamlessly with simulation environments like Gazebo and Unity Robotics.

## Best Practices

1. **Use Composition**: Create composable nodes for better resource management
2. **Parameter Management**: Use parameter files for configuration
3. **Lifecycle Nodes**: Implement lifecycle management for complex systems
4. **Testing**: Write unit and integration tests for your nodes
5. **Documentation**: Document your packages and APIs

## Troubleshooting Common Issues

### Environment Setup
Make sure to source your ROS 2 installation in each terminal:
```bash
source /opt/ros/humble/setup.bash
```

### Network Configuration
For multi-machine setups, configure DDS discovery properly.

## Next Steps

In the next sections, we'll explore:
- Advanced ROS 2 concepts like actions and services
- Robot control with ros2_control
- Integration with perception systems
- Best practices for large-scale robotic systems

Use the AI assistant (click the blue button in the bottom-right) if you have questions about any of these concepts or need clarification on ROS 2 architecture!