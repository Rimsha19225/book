---
sidebar_position: 3
title: "ROS 2 Packages and Workspaces"
description: "Learn how to create, manage, and organize ROS 2 packages in workspaces"
keywords: ["ROS 2", "packages", "workspaces", "cmake", "ament", "build system", "robotics"]
---

# ROS 2 Packages and Workspaces

## Understanding ROS 2 Packages

A package is the basic building block of a ROS 2 system. It contains nodes, libraries, and other resources that perform specific functions. Packages provide modularity, reusability, and maintainability to ROS 2 projects.

### Package Structure

A typical ROS 2 package follows this structure:

```
my_robot_package/
├── CMakeLists.txt          # Build configuration for C++
├── package.xml             # Package metadata and dependencies
├── src/                    # Source code files
├── include/                # Header files (C++)
├── scripts/                # Executable scripts
├── launch/                 # Launch files
├── config/                 # Configuration files
├── test/                   # Test files
└── README.md               # Package documentation
```

### Package.xml File

The `package.xml` file contains metadata about the package:

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_robot_package</name>
  <version>0.0.0</version>
  <description>Example robot package</description>
  <maintainer email="user@example.com">User Name</maintainer>
  <license>Apache License 2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

## Creating Packages

### Using ros2 pkg Command

The easiest way to create a package is using the `ros2 pkg create` command:

```bash
# Create a Python package
ros2 pkg create --build-type ament_python my_python_package

# Create a C++ package
ros2 pkg create --build-type ament_cmake my_cpp_package

# Create a package with dependencies
ros2 pkg create --build-type ament_cmake my_robot_package --dependencies rclcpp std_msgs geometry_msgs
```

### Python Package Structure

For Python packages, the structure is slightly different:

```
my_python_package/
├── package.xml
├── setup.py
├── setup.cfg
├── resource/my_python_package
├── my_python_package/
│   ├── __init__.py
│   └── my_node.py
└── test/
    └── test_copyright.py
```

The `setup.py` file for Python packages:

```python
from setuptools import setup
import os
from glob import glob

package_name = 'my_python_package'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Include all launch files
        (os.path.join('share', package_name, 'launch'), glob('launch/*launch.[pxy][yma]*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your.email@example.com',
    description='TODO: Package description',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_node = my_python_package.my_node:main',
        ],
    },
)
```

### C++ Package Structure

For C++ packages, you'll have a `CMakeLists.txt` file:

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_cpp_package)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Create executable
add_executable(my_node src/my_node.cpp)
ament_target_dependencies(my_node rclcpp std_msgs)

# Install targets
install(TARGETS
  my_node
  DESTINATION lib/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  set(ament_cmake_copyright_FOUND TRUE)
  set(ament_cmake_flake8_FOUND TRUE)
  set(ament_cmake_pep257_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

## Workspaces

### What is a Workspace?

A workspace is a directory that contains multiple ROS 2 packages. It provides a unified environment for building and running your ROS 2 projects.

### Workspace Structure

```
ros2_workspace/
├── src/                    # Source packages
│   ├── my_robot_package/
│   ├── navigation_package/
│   └── perception_package/
├── build/                  # Build artifacts
├── install/                # Install space
└── log/                    # Build logs
```

### Creating a Workspace

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src

# Navigate to workspace
cd ~/ros2_ws

# Build all packages in workspace
colcon build

# Source the workspace
source install/setup.bash
```

## Build Systems

### Ament Build Systems

ROS 2 supports multiple build systems:

1. **ament_cmake**: For C++ packages using CMake
2. **ament_python**: For Python packages
3. **ament_cmake_python**: For packages with both C++ and Python components

### Build Commands

```bash
# Build specific package
colcon build --packages-select my_package

# Build with additional CMake arguments
colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release

# Build with verbose output
colcon build --event-handlers console_direct+

# Clean build and rebuild
colcon build --packages-select my_package --symlink-install
```

## Package Dependencies

### Understanding Dependencies

Packages can have different types of dependencies:

- **buildtool_depend**: Build tools required to build the package
- **build_depend**: Packages required to build this package
- **exec_depend**: Packages required to run nodes in this package
- **test_depend**: Packages required for testing

### Managing Dependencies

```bash
# Install dependencies using rosdep
rosdep install --from-paths src --ignore-src -r -y

# List package dependencies
ros2 pkg dependencies my_package

# Find packages that depend on a specific package
ros2 pkg executables my_package
```

## Launch Files

Launch files allow you to start multiple nodes with a single command:

```python
# launch/my_launch_file.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_package',
            executable='robot_controller',
            name='robot_controller',
            parameters=[
                {'param1': 'value1'},
                {'param2': 123}
            ],
            remappings=[
                ('/original_topic', '/remapped_topic')
            ]
        ),
        Node(
            package='my_robot_package',
            executable='sensor_processor',
            name='sensor_processor'
        )
    ])
```

Run the launch file:
```bash
ros2 launch my_robot_package my_launch_file.launch.py
```

## Practical Example: Complete Package

Let's create a complete example package that demonstrates best practices:

### Package.xml
```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>robot_controller</name>
  <version>1.0.0</version>
  <description>Robot controller package with various components</description>
  <maintainer email="maintainer@robotics.org">Robotics Team</maintainer>
  <license>Apache License 2.0</license>

  <buildtool_depend>ament_cmake_python</buildtool_depend>

  <depend>rclpy</depend>
  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>nav_msgs</depend>

  <exec_depend>ros2launch</exec_depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake_python</build_type>
  </export>
</package>
```

### Python Node Example
```python
# robot_controller/robot_controller.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
from std_msgs.msg import Float32

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # Subscribers
        self.scan_sub = self.create_subscription(
            LaserScan, 'scan', self.scan_callback, 10)

        # Parameters
        self.declare_parameter('max_linear_velocity', 1.0)
        self.declare_parameter('max_angular_velocity', 1.0)

        # Timers
        self.control_timer = self.create_timer(0.1, self.control_loop)

        self.closest_obstacle = float('inf')
        self.get_logger().info('Robot controller initialized')

    def scan_callback(self, msg):
        if len(msg.ranges) > 0:
            valid_ranges = [r for r in msg.ranges if 0.1 < r < 10.0]
            if valid_ranges:
                self.closest_obstacle = min(valid_ranges)

    def control_loop(self):
        cmd_msg = Twist()

        if self.closest_obstacle > 1.0:  # Safe distance
            cmd_msg.linear.x = self.get_parameter('max_linear_velocity').get_parameter_value().double_value
            cmd_msg.angular.z = 0.0
        else:  # Obstacle detected
            cmd_msg.linear.x = 0.0
            cmd_msg.angular.z = self.get_parameter('max_angular_velocity').get_parameter_value().double_value * 0.5

        self.cmd_vel_pub.publish(cmd_msg)

def main(args=None):
    rclpy.init(args=args)
    controller = RobotController()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Best Practices

### 1. Package Organization

- Keep packages focused on a single purpose
- Use descriptive names that reflect functionality
- Follow naming conventions (lowercase with underscores)

### 2. Dependency Management

- Declare all dependencies explicitly in package.xml
- Use version constraints when necessary
- Regularly update dependencies

### 3. Build Configuration

- Use appropriate build types for your language
- Optimize build flags for performance
- Include tests in your build process

### 4. Documentation

- Include README files in packages
- Document parameters and configuration
- Provide usage examples

## Troubleshooting Common Issues

### Build Errors

If packages fail to build:
1. Check dependency declarations in package.xml
2. Verify CMakeLists.txt or setup.py configuration
3. Ensure proper file permissions
4. Check for missing header files or import statements

### Package Not Found

If ROS 2 can't find your package:
1. Ensure you've sourced the workspace: `source install/setup.bash`
2. Check that the package is in the src directory
3. Verify the package.xml file is properly formatted
4. Rebuild the workspace if needed

## Summary

In this chapter, we've covered the essential aspects of ROS 2 packages and workspaces:
- Package structure and organization
- Creating packages with different build systems
- Workspace management and building
- Dependency management
- Launch files for node orchestration

Understanding packages and workspaces is fundamental to organizing and building ROS 2 projects effectively. In the next chapter, we'll explore practical examples and advanced ROS 2 concepts.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about any of these concepts or need clarification on ROS 2 packages and workspaces!