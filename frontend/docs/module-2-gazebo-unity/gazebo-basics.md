---
sidebar_position: 2
title: "Gazebo Simulation Fundamentals"
description: "Learn the core concepts and practical usage of Gazebo for robotics simulation"
keywords: ["Gazebo", "simulation", "robotics", "physics", "SDF", "worlds", "models"]
---

# Gazebo Simulation Fundamentals

## Understanding Gazebo Architecture

Gazebo is a 3D simulation environment that provides realistic physics simulation, high-quality graphics, and convenient programmatic interfaces. It's widely used in robotics research and development for testing algorithms, validating designs, and training AI systems.

### Core Components

Gazebo consists of several key components:

1. **Physics Engine**: Handles collision detection and response (ODE, Bullet, DART)
2. **Rendering Engine**: Provides 3D visualization (OGRE-based)
3. **Sensor System**: Simulates various sensors (cameras, LIDAR, IMU, etc.)
4. **GUI System**: Provides user interface for visualization and interaction
5. **Plugin System**: Extends functionality through custom code

## Installation and Setup

### Installing Gazebo Garden

```bash
# Update package lists
sudo apt update

# Install Gazebo Garden
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-ros2-control

# Install additional plugins
sudo apt install ros-humble-gazebo-dev
```

### Environment Setup

```bash
# Source ROS 2 environment
source /opt/ros/humble/setup.bash

# Source Gazebo environment
source /usr/share/gazebo/setup.sh

# Set Gazebo model paths
export GZ_SIM_RESOURCE_PATH=$HOME/.gazebo/models:$GZ_SIM_RESOURCE_PATH
```

## World Files and SDF Format

### SDF (Simulation Description Format)

SDF is an XML-based format that describes simulation environments, models, and their properties.

### Basic World Structure

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="simple_world">
    <!-- Include default ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Include default lighting -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Add your models here -->
    <model name="my_robot">
      <!-- Model definition -->
    </model>
  </world>
</sdf>
```

### Creating a Custom World

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="my_office_world">
    <!-- Physics parameters -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Lighting -->
    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.3 0.3 -0.9</direction>
    </light>

    <!-- Ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.7 0.7 0.7 1</ambient>
            <diffuse>0.7 0.7 0.7 1</diffuse>
            <specular>0.7 0.7 0.7 1</specular>
          </material>
        </visual>
      </link>
    </model>

    <!-- Custom objects -->
    <model name="table">
      <pose>2 0 0 0 0 0</pose>
      <link name="table_base">
        <collision name="collision">
          <geometry>
            <box>
              <size>1.5 0.8 0.8</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1.5 0.8 0.8</size>
            </box>
          </geometry>
          <material>
            <ambient>0.5 0.3 0.1 1</ambient>
            <diffuse>0.8 0.6 0.4 1</diffuse>
            <specular>0.2 0.2 0.2 1</specular>
          </material>
        </visual>
        <inertial>
          <mass>10.0</mass>
          <inertia>
            <ixx>1.0</ixx>
            <iyy>1.0</iyy>
            <izz>1.0</izz>
          </inertia>
        </inertial>
      </link>
    </model>
  </world>
</sdf>
```

## Model Creation and SDF

### Basic Robot Model

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <model name="simple_robot">
    <!-- Robot pose -->
    <pose>0 0 0.5 0 0 0</pose>

    <!-- Chassis link -->
    <link name="chassis">
      <pose>0 0 0.1 0 0 0</pose>
      <collision name="collision">
        <geometry>
          <box>
            <size>0.5 0.3 0.2</size>
          </box>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <box>
            <size>0.5 0.3 0.2</size>
          </box>
        </geometry>
        <material>
          <ambient>0.8 0.8 0.8 1</ambient>
          <diffuse>0.8 0.8 0.8 1</diffuse>
          <specular>0.5 0.5 0.5 1</specular>
        </material>
      </visual>
      <inertial>
        <mass>2.0</mass>
        <inertia>
          <ixx>0.025</ixx>
          <iyy>0.05</iyy>
          <izz>0.065</izz>
        </inertia>
      </inertial>
    </link>

    <!-- Left wheel -->
    <link name="left_wheel">
      <pose>-0.15 0.2 0.05 0 0 0</pose>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.04</length>
          </cylinder>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.04</length>
          </cylinder>
        </geometry>
        <material>
          <ambient>0.2 0.2 0.2 1</ambient>
          <diffuse>0.2 0.2 0.2 1</diffuse>
          <specular>0.5 0.5 0.5 1</specular>
        </material>
      </visual>
      <inertial>
        <mass>0.1</mass>
        <inertia>
          <ixx>0.0001</ixx>
          <iyy>0.0001</iyy>
          <izz>0.00005</izz>
        </inertia>
      </inertial>
    </link>

    <!-- Right wheel -->
    <link name="right_wheel">
      <pose>-0.15 -0.2 0.05 0 0 0</pose>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.04</length>
          </cylinder>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.05</radius>
            <length>0.04</length>
          </cylinder>
        </geometry>
        <material>
          <ambient>0.2 0.2 0.2 1</ambient>
          <diffuse>0.2 0.2 0.2 1</diffuse>
          <specular>0.5 0.5 0.5 1</specular>
        </material>
      </visual>
      <inertial>
        <mass>0.1</mass>
        <inertia>
          <ixx>0.0001</ixx>
          <iyy>0.0001</iyy>
          <izz>0.00005</izz>
        </inertia>
      </inertial>
    </link>

    <!-- Joints to connect wheels to chassis -->
    <joint name="left_wheel_joint" type="revolute">
      <parent>chassis</parent>
      <child>left_wheel</child>
      <axis>
        <xyz>0 1 0</xyz>
        <limit>
          <lower>-1e16</lower>
          <upper>1e16</upper>
        </limit>
      </axis>
      <pose>-0.15 0.2 0.05 0 0 0</pose>
    </joint>

    <joint name="right_wheel_joint" type="revolute">
      <parent>chassis</parent>
      <child>right_wheel</child>
      <axis>
        <xyz>0 1 0</xyz>
        <limit>
          <lower>-1e16</lower>
          <upper>1e16</upper>
        </limit>
      </axis>
      <pose>-0.15 -0.2 0.05 0 0 0</pose>
    </joint>
  </model>
</sdf>
```

## Gazebo Plugins

### Creating a Custom Plugin

```cpp
// differential_drive_plugin.cpp
#include <gazebo/gazebo.hh>
#include <gazebo/physics/physics.hh>
#include <gazebo/transport/transport.hh>
#include <gazebo/msgs/msgs.hh>
#include <thread>

namespace gazebo
{
  class DifferentialDrivePlugin : public ModelPlugin
  {
    public: void Load(physics::ModelPtr _model, sdf::ElementPtr _sdf)
    {
      this->model = _model;

      // Initialize joints
      this->leftJoint = _model->GetJoint("left_wheel_joint");
      this->rightJoint = _model->GetJoint("right_wheel_joint");

      // Initialize communication
      this->node = transport::NodePtr(new transport::Node());
      this->node->Init(this->model->GetWorld()->Name());

      // Subscribe to command topic
      this->cmdSub = this->node->Subscribe("~/cmd_vel",
        &DifferentialDrivePlugin::OnCmdVel, this);

      // Connect to physics update
      this->updateConnection = event::Events::ConnectWorldUpdateBegin(
        std::bind(&DifferentialDrivePlugin::OnUpdate, this));
    }

    private: void OnCmdVel(ConstPtrs::msgs::TwistPtr &_msg)
    {
      this->targetVelLeft = _msg->linear().x() - _msg->angular().z() * 0.1; // 0.1 = wheel separation / 2
      this->targetVelRight = _msg->linear().x() + _msg->angular().z() * 0.1;
    }

    private: void OnUpdate()
    {
      if (this->leftJoint && this->rightJoint)
      {
        this->leftJoint->SetParam("vel", 0, this->targetVelLeft);
        this->rightJoint->SetParam("vel", 0, this->targetVelRight);
      }
    }

    private: physics::ModelPtr model;
    private: physics::JointPtr leftJoint, rightJoint;
    private: transport::NodePtr node;
    private: transport::SubscriberPtr cmdSub;
    private: event::ConnectionPtr updateConnection;
    private: double targetVelLeft, targetVelRight;
  };

  GZ_REGISTER_MODEL_PLUGIN(DifferentialDrivePlugin)
}
```

### Plugin Configuration in Model

```xml
<model name="robot_with_plugin">
  <!-- ... other model elements ... -->

  <plugin name="differential_drive" filename="libDifferentialDrivePlugin.so">
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.2</wheel_separation>
    <wheel_diameter>0.1</wheel_diameter>
  </plugin>
</model>
```

## Sensor Integration

### Camera Sensor

```xml
<link name="camera_link">
  <sensor name="camera" type="camera">
    <camera>
      <horizontal_fov>1.047</horizontal_fov> <!-- 60 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>10.0</far>
      </clip>
    </camera>
    <always_on>1</always_on>
    <update_rate>30</update_rate>
    <visualize>true</visualize>
  </sensor>
</link>
```

### LIDAR Sensor

```xml
<link name="lidar_link">
  <sensor name="lidar" type="gpu_lidar">
    <pose>0 0 0.1 0 0 0</pose>
    <lidar>
      <scan>
        <horizontal>
          <samples>360</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle> <!-- -π -->
          <max_angle>3.14159</max_angle>   <!-- π -->
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>10.0</max>
        <resolution>0.01</resolution>
      </range>
    </lidar>
    <always_on>1</always_on>
    <update_rate>10</update_rate>
    <visualize>true</visualize>
  </sensor>
</link>
```

## Launching and Controlling Simulations

### Gazebo Commands

```bash
# Launch Gazebo with a world file
gz sim -r my_world.sdf

# Launch with verbose output
gz sim -v 4 -r my_world.sdf

# Launch with GUI only
gz sim my_world.sdf

# Launch headless (no GUI)
gz sim -s my_world.sdf
```

### ROS 2 Integration

```python
# launch/gazebo_launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare
from launch_ros.actions import Node

def generate_launch_description():
    # Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('gazebo_ros'),
                'launch',
                'gazebo.launch.py'
            ])
        ]),
        launch_arguments={
            'world': PathJoinSubstitution([
                FindPackageShare('my_robot_gazebo'),
                'worlds',
                'my_world.sdf'
            ])
        }.items()
    )

    # Spawn robot in Gazebo
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', 'my_robot'
        ],
        output='screen'
    )

    return LaunchDescription([
        gazebo,
        spawn_entity
    ])
```

## Physics Configuration

### Physics Engine Parameters

```xml
<physics type="ode">
  <!-- Time stepping -->
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>

  <!-- Solver parameters -->
  <ode>
    <solver>
      <type>quick</type>
      <iters>10</iters>
      <sor>1.3</sor>
    </solver>
    <constraints>
      <cfm>0.0</cfm>
      <erp>0.2</erp>
      <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

## Best Practices

### 1. Performance Optimization

- Use simplified collision geometry for complex models
- Limit physics update rate to what's necessary
- Use appropriate solver parameters
- Reduce visual complexity when running headless

### 2. Model Design

- Use proper inertial properties
- Ensure collision and visual geometries match
- Use appropriate materials and textures
- Test models in isolation before complex scenarios

### 3. World Design

- Organize complex worlds into separate models
- Use appropriate lighting and shadows
- Consider computational complexity
- Validate physics parameters

## Troubleshooting Common Issues

### Physics Issues

If objects are behaving unexpectedly:
1. Check inertial properties are properly defined
2. Verify mass values are reasonable
3. Adjust solver parameters if needed
4. Check for intersecting collision geometries

### Performance Problems

For slow simulation:
1. Reduce physics update rate
2. Simplify collision meshes
3. Use less complex physics engine
4. Reduce visual quality settings

### Plugin Issues

If plugins aren't loading:
1. Verify plugin library is compiled and in Gazebo path
2. Check plugin filename in SDF matches library name
3. Ensure proper Gazebo version compatibility
4. Check for missing dependencies

## Practical Example: Complete Mobile Robot

Let's create a complete mobile robot model with sensors and control:

### Complete Robot Model (robot.sdf)

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <model name="mobile_robot">
    <link name="base_link">
      <pose>0 0 0.1 0 0 0</pose>
      <inertial>
        <mass>5.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <iyy>0.2</iyy>
          <izz>0.2</izz>
        </inertia>
      </inertial>

      <!-- Visual and collision for base -->
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.15</radius>
            <length>0.1</length>
          </cylinder>
        </geometry>
      </collision>

      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.15</radius>
            <length>0.1</length>
          </cylinder>
        </geometry>
        <material>
          <ambient>0.2 0.6 1.0 1</ambient>
          <diffuse>0.2 0.6 1.0 1</diffuse>
        </material>
      </visual>
    </link>

    <!-- Camera -->
    <link name="camera_link">
      <pose>0.1 0 0.1 0 0 0</pose>
      <sensor name="camera" type="camera">
        <camera>
          <horizontal_fov>1.047</horizontal_fov>
          <image>
            <width>640</width>
            <height>480</height>
          </image>
          <clip>
            <near>0.1</near>
            <far>10.0</far>
          </clip>
        </camera>
        <always_on>1</always_on>
        <update_rate>30</update_rate>
        <visualize>true</visualize>
      </sensor>
    </link>

    <!-- IMU -->
    <link name="imu_link">
      <pose>0 0 0.05 0 0 0</pose>
      <sensor name="imu" type="imu">
        <always_on>1</always_on>
        <update_rate>100</update_rate>
      </sensor>
    </link>

    <!-- Joint connecting camera to base -->
    <joint name="camera_joint" type="fixed">
      <parent>base_link</parent>
      <child>camera_link</child>
    </joint>

    <!-- Joint connecting IMU to base -->
    <joint name="imu_joint" type="fixed">
      <parent>base_link</parent>
      <child>imu_link</child>
    </joint>

    <!-- Differential drive plugin -->
    <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.3</wheel_separation>
      <wheel_diameter>0.1</wheel_diameter>
      <command_topic>cmd_vel</command_topic>
      <odometry_topic>odom</odometry_topic>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_link</robot_base_frame>
    </plugin>
  </model>
</sdf>
```

## Summary

In this chapter, we've covered the fundamental concepts of Gazebo simulation:
- SDF format and world creation
- Model definition with links, joints, and sensors
- Plugin development for custom functionality
- Physics configuration and optimization
- Integration with ROS 2

Gazebo provides a powerful platform for robotics simulation with extensive customization options. Understanding these fundamentals is essential for creating effective simulation environments.

In the next chapter, we'll explore Unity integration for robotics simulation and its unique capabilities.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about Gazebo concepts or need help with creating your own simulation environments!