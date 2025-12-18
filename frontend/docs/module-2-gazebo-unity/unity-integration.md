---
sidebar_position: 3
title: "Unity Robotics Integration"
description: "Learn how to use Unity for robotics simulation and AI training"
keywords: ["Unity", "robotics", "simulation", "ML-Agents", "ROS TCP", "XR", "physics"]
---

# Unity Robotics Integration

## Introduction to Unity for Robotics

Unity has emerged as a powerful platform for robotics simulation, offering high-fidelity graphics, advanced physics, and built-in AI training capabilities. The Unity Robotics ecosystem provides tools specifically designed for robotics applications, including the ROS TCP Connector and ML-Agents.

### Why Unity for Robotics?

Unity offers several advantages for robotics development:

1. **High-Fidelity Graphics**: Photorealistic rendering for computer vision training
2. **Advanced Physics**: NVIDIA PhysX engine for realistic simulation
3. **AI Training**: Built-in ML-Agents for reinforcement learning
4. **Visual Editor**: Intuitive drag-and-drop interface
5. **XR Support**: Virtual and augmented reality capabilities
6. **Asset Store**: Extensive library of models and environments

## Setting Up Unity for Robotics

### Prerequisites

- Unity Hub and Unity 2021.3 LTS or later
- Unity Robotics Package
- ROS TCP Connector
- Compatible ROS 2 installation

### Installation Steps

1. **Install Unity Hub** from unity.com
2. **Install Unity 2021.3 LTS** through Unity Hub
3. **Create a new 3D project**
4. **Import Unity Robotics packages** through Package Manager

### Unity Robotics Package Manager Setup

```json
// Add to Packages/manifest.json
{
  "dependencies": {
    "com.unity.robotics.ros-tcp-connector": "https://github.com/Unity-Technologies/ROS-TCP-Connector.git",
    "com.unity.robotics.urdf-importer": "https://github.com/Unity-Technologies/URDF-Importer.git",
    "com.unity.ml-agents": "https://github.com/Unity-Technologies/ml-agents.git?path=/com.unity.ml-agents#2.3.0-exp.1"
  }
}
```

## URDF Importer

### Importing ROS Robots

Unity's URDF Importer allows you to import robots defined in URDF format:

```csharp
// Example: Import and configure a robot
using Unity.Robotics.URDFImport;

public class RobotImporter : MonoBehaviour
{
    [SerializeField] private string urdfPath;
    [SerializeField] private GameObject importedRobot;

    public void ImportRobot()
    {
        // Import URDF file
        importedRobot = URDFRobotExtensions.CreateRobot(urdfPath);

        // Configure joint controllers
        ConfigureJointControllers();
    }

    private void ConfigureJointControllers()
    {
        var joints = importedRobot.GetComponentsInChildren<ArticulationBody>();
        foreach (var joint in joints)
        {
            // Configure joint properties
            joint.linearDamping = 0.05f;
            joint.angularDamping = 0.05f;
        }
    }
}
```

### URDF to Unity Conversion

When importing URDF files, Unity automatically:
- Converts links to ArticulationBody components
- Maps joints to Unity's joint system
- Preserves visual and collision meshes
- Maintains kinematic relationships

## ROS TCP Connector

### Establishing Communication

The ROS TCP Connector enables communication between Unity and ROS 2:

```csharp
// RobotController.cs
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor;

public class RobotController : MonoBehaviour
{
    ROSConnection ros;
    public string rosIP = "127.0.0.1";
    public int rosPort = 10000;

    [Header("Robot Configuration")]
    public float linearSpeed = 1.0f;
    public float angularSpeed = 1.0f;

    [Header("Sensors")]
    public Camera rgbCamera;
    public GameObject lidarSensor;

    void Start()
    {
        // Initialize ROS connection
        ros = ROSConnection.GetOrCreateInstance();
        ros.Initialize(rosIP, rosPort);

        // Register publishers and subscribers
        ros.RegisterPublisher<TwistMsg>("/cmd_vel");
        ros.RegisterSubscriber<JointStateMsg>("/joint_states", OnJointStateReceived);
        ros.RegisterSubscriber<OdometryMsg>("/odom", OnOdometryReceived);

        // Start sensor publishers
        StartCoroutine(PublishCameraFeed());
        StartCoroutine(PublishLidarData());
    }

    void Update()
    {
        // Handle keyboard input for manual control
        float linear = Input.GetAxis("Vertical") * linearSpeed;
        float angular = Input.GetAxis("Horizontal") * angularSpeed;

        if (linear != 0 || angular != 0)
        {
            SendVelocityCommand(linear, angular);
        }
    }

    void SendVelocityCommand(float linear, float angular)
    {
        var twist = new TwistMsg();
        twist.linear = new Vector3Msg { x = linear, y = 0, z = 0 };
        twist.angular = new Vector3Msg { x = 0, y = 0, z = angular };

        ros.Publish("/cmd_vel", twist);
    }

    void OnJointStateReceived(JointStateMsg jointState)
    {
        // Process joint state messages
        Debug.Log($"Received joint states: {jointState.name.Length} joints");
    }

    void OnOdometryReceived(OdometryMsg odometry)
    {
        // Process odometry messages
        Debug.Log($"Robot position: {odometry.pose.pose.position.x}, {odometry.pose.position.y}");
    }

    System.Collections.IEnumerator PublishCameraFeed()
    {
        while (true)
        {
            yield return new WaitForSeconds(0.1f); // 10 Hz

            // Capture and publish camera image
            var texture = new RenderTexture(640, 480, 24);
            rgbCamera.targetTexture = texture;
            rgbCamera.Render();

            // Convert texture to ROS image message
            var imageMsg = TextureToImageMsg(texture);
            ros.Publish("/camera/image_raw", imageMsg);

            RenderTexture.ReleaseTemporary(texture);
        }
    }

    ImageMsg TextureToImageMsg(RenderTexture texture)
    {
        // Convert RenderTexture to ImageMsg
        var tempRT = RenderTexture.active;
        RenderTexture.active = texture;

        var texture2D = new Texture2D(texture.width, texture.height, TextureFormat.RGB24, false);
        texture2D.ReadPixels(new Rect(0, 0, texture.width, texture.height), 0, 0);
        texture2D.Apply();

        var bytes = texture2D.EncodeToPNG();
        Destroy(texture2D);
        RenderTexture.active = tempRT;

        return new ImageMsg
        {
            header = new std_msgs.HeaderMsg { stamp = new builtin_interfaces.TimeMsg { sec = (int)Time.time } },
            height = (uint)texture.height,
            width = (uint)texture.width,
            encoding = "rgb8",
            is_bigendian = 0,
            step = (uint)(texture.width * 3),
            data = bytes
        };
    }
}
```

### Advanced ROS Communication

```csharp
// AdvancedRobotController.cs
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Nav;

public class AdvancedRobotController : MonoBehaviour
{
    ROSConnection ros;
    private float[] jointPositions;
    private float[] jointVelocities;

    [Header("Service Clients")]
    public string moveBaseService = "/move_base";

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();

        // Register for various message types
        ros.RegisterPublisher<JointStateMsg>("/joint_states");
        ros.RegisterPublisher<OdometryMsg>("/odom");
        ros.RegisterSubscriber<SetBoolRequest>("/enable_motors", OnMotorEnableRequest);
    }

    void FixedUpdate()
    {
        // Publish joint states
        PublishJointStates();

        // Publish odometry
        PublishOdometry();
    }

    void PublishJointStates()
    {
        var jointState = new JointStateMsg();
        jointState.header.stamp = new builtin_interfaces.TimeMsg { sec = (int)Time.time };
        jointState.name = GetJointNames();
        jointState.position = GetJointPositions();
        jointState.velocity = GetJointVelocities();
        jointState.effort = GetJointEfforts();

        ros.Publish("/joint_states", jointState);
    }

    void PublishOdometry()
    {
        var odom = new OdometryMsg();
        odom.header.stamp = new builtin_interfaces.TimeMsg { sec = (int)Time.time };
        odom.header.frame_id = "odom";
        odom.child_frame_id = "base_link";

        // Set position and orientation
        odom.pose.pose.position = new geometry_msgs.PointMsg
        {
            x = transform.position.x,
            y = transform.position.y,
            z = transform.position.z
        };

        odom.pose.pose.orientation = new geometry_msgs.QuaternionMsg
        {
            x = transform.rotation.x,
            y = transform.rotation.y,
            z = transform.rotation.z,
            w = transform.rotation.w
        };

        // Set velocities
        odom.twist.twist.linear = new geometry_msgs.Vector3Msg
        {
            x = GetComponent<Rigidbody>().velocity.x,
            y = GetComponent<Rigidbody>().velocity.y,
            z = GetComponent<Rigidbody>().velocity.z
        };

        ros.Publish("/odom", odom);
    }

    string[] GetJointNames()
    {
        // Return joint names for your robot
        return new string[] { "joint1", "joint2", "joint3" };
    }

    float[] GetJointPositions()
    {
        // Return current joint positions
        return new float[] { 0.0f, 0.0f, 0.0f };
    }

    float[] GetJointVelocities()
    {
        // Return current joint velocities
        return new float[] { 0.0f, 0.0f, 0.0f };
    }

    float[] GetJointEfforts()
    {
        // Return current joint efforts/torques
        return new float[] { 0.0f, 0.0f, 0.0f };
    }

    void OnMotorEnableRequest(SetBoolRequest request)
    {
        // Handle motor enable/disable request
        Debug.Log($"Motor enable request: {request.data}");
        // Implement motor control logic here
    }
}
```

## ML-Agents for Robotics

### Setting Up ML-Agents

ML-Agents enables reinforcement learning in Unity for robotics applications:

```csharp
// RobotAgent.cs
using Unity.MLAgents;
using Unity.MLAgents.Sensors;
using Unity.MLAgents.Actuators;

public class RobotAgent : Agent
{
    [Header("Robot Components")]
    public Transform target;
    public Rigidbody robotRigidbody;
    public float moveSpeed = 5f;

    [Header("Reward Settings")]
    public float reachTargetReward = 10f;
    public float collisionPenalty = -1f;
    public float timePenalty = -0.01f;

    public override void OnEpisodeBegin()
    {
        // Reset robot position
        transform.position = new Vector3(Random.Range(-5f, 5f), 0.5f, Random.Range(-5f, 5f));

        // Reset target position
        target.position = new Vector3(Random.Range(-4f, 4f), 0.5f, Random.Range(-4f, 4f));
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Add robot position relative to target
        sensor.AddObservation(Vector3.Distance(transform.position, target.position));

        // Add robot velocity
        sensor.AddObservation(robotRigidbody.velocity);

        // Add direction to target
        Vector3 directionToTarget = (target.position - transform.position).normalized;
        sensor.AddObservation(directionToTarget);

        // Add robot rotation
        sensor.AddObservation(transform.rotation);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        // Extract actions
        float forward = actions.ContinuousActions[0];
        float turn = actions.ContinuousActions[1];

        // Apply movement
        robotRigidbody.AddForce(transform.forward * forward * moveSpeed);
        transform.Rotate(Vector3.up, turn * moveSpeed * Time.fixedDeltaTime);

        // Apply time penalty
        SetReward(timePenalty);

        // Check if reached target
        if (Vector3.Distance(transform.position, target.position) < 1.0f)
        {
            SetReward(reachTargetReward);
            EndEpisode();
        }

        // Check for collisions
        if (GetComponent<CollisionDetector>().HasCollided)
        {
            SetReward(collisionPenalty);
            EndEpisode();
        }
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        // Manual control for testing
        var continuousActionsOut = actionsOut.ContinuousActions;
        continuousActionsOut[0] = Input.GetAxis("Vertical"); // Forward/back
        continuousActionsOut[1] = Input.GetAxis("Horizontal"); // Turn
    }
}
```

### Training Configuration

```yaml
# trainer_config.yaml
behaviors:
  RobotNavigation:
    trainer_type: ppo
    hyperparameters:
      batch_size: 1024
      buffer_size: 4096
      learning_rate: 3.0e-4
      beta: 5.0e-3
      epsilon: 0.2
      lambd: 0.95
      num_epoch: 3
      learning_rate_schedule: linear
    network_settings:
      normalize: false
      hidden_units: 256
      num_layers: 2
    max_steps: 500000
    time_horizon: 64
    summary_freq: 10000
```

## Physics Configuration for Robotics

### PhysX Settings for Robotics

Unity's PhysX engine can be configured for robotics applications:

```csharp
// PhysicsSettings.cs
using UnityEngine;

[CreateAssetMenu(fileName = "PhysicsSettings", menuName = "Robotics/Physics Settings")]
public class PhysicsSettings : ScriptableObject
{
    [Header("Simulation Parameters")]
    public float fixedDeltaTime = 0.02f; // 50 Hz physics update
    public float maximumDeltaTime = 0.333f;
    public int maximumAllowedTimestep = 1;

    [Header("Solver Parameters")]
    public int solverIterationCount = 6;
    public int solverVelocityIterationCount = 1;

    [Header("Collision Detection")]
    public CollisionDetectionMode collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;
    public float sleepThreshold = 0.005f;
    public float defaultContactOffset = 0.01f;

    [Header("Articulation Body Settings")]
    public float jointDamping = 0.05f;
    public float jointFriction = 0.0f;
    public float maxJointVelocity = 100f;

    public void ApplySettings()
    {
        Time.fixedDeltaTime = fixedDeltaTime;
        Time.maximumDeltaTime = maximumDeltaTime;
        Time.maxDeltaTime = maximumAllowedTimestep;

        Physics.defaultSolverIterations = solverIterationCount;
        Physics.defaultSolverVelocityIterations = solverVelocityIterationCount;
        Physics.sleepThreshold = sleepThreshold;
        Physics.defaultContactOffset = defaultContactOffset;
    }
}
```

### Advanced Joint Control

```csharp
// AdvancedJointController.cs
using UnityEngine;

public class AdvancedJointController : MonoBehaviour
{
    [System.Serializable]
    public class JointConfig
    {
        public ArticulationBody joint;
        public float targetPosition;
        public float targetVelocity;
        public float stiffness = 100f;
        public float damping = 10f;
        public float forceLimit = 100f;
    }

    public JointConfig[] joints;

    void FixedUpdate()
    {
        foreach (var jointConfig in joints)
        {
            if (jointConfig.joint != null)
            {
                // Set drive parameters
                var drive = jointConfig.joint.xDrive;
                drive.stiffness = jointConfig.stiffness;
                drive.damping = jointConfig.damping;
                drive.forceLimit = jointConfig.forceLimit;
                drive.target = jointConfig.targetPosition;
                drive.targetVelocity = jointConfig.targetVelocity;

                jointConfig.joint.xDrive = drive;
            }
        }
    }

    public void SetJointPositions(float[] positions)
    {
        for (int i = 0; i < Mathf.Min(joints.Length, positions.Length); i++)
        {
            joints[i].targetPosition = positions[i];
        }
    }
}
```

## Sensor Simulation

### Custom Sensor Implementation

```csharp
// CustomLidarSensor.cs
using UnityEngine;
using System.Collections.Generic;

public class CustomLidarSensor : MonoBehaviour
{
    [Header("LIDAR Configuration")]
    public int rayCount = 360;
    public float maxDistance = 10f;
    public float fieldOfView = 360f;
    public LayerMask detectionMask = -1;

    [Header("Output Settings")]
    public string topicName = "/scan";
    public float publishRate = 10f; // Hz

    private float publishInterval;
    private float lastPublishTime;
    private ROSConnection ros;

    private List<float> ranges;

    void Start()
    {
        publishInterval = 1f / publishRate;
        ranges = new List<float>(new float[rayCount]);

        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<LaserScanMsg>(topicName);
    }

    void Update()
    {
        if (Time.time - lastPublishTime >= publishInterval)
        {
            ScanEnvironment();
            PublishScanData();
            lastPublishTime = Time.time;
        }
    }

    void ScanEnvironment()
    {
        float angleStep = fieldOfView / rayCount;
        float startAngle = -fieldOfView / 2f;

        for (int i = 0; i < rayCount; i++)
        {
            float angle = startAngle + (i * angleStep);
            Vector3 direction = Quaternion.Euler(0, angle, 0) * transform.forward;

            RaycastHit hit;
            if (Physics.Raycast(transform.position, direction, out hit, maxDistance, detectionMask))
            {
                ranges[i] = hit.distance;
            }
            else
            {
                ranges[i] = maxDistance;
            }
        }
    }

    void PublishScanData()
    {
        var scanMsg = new LaserScanMsg();
        scanMsg.header.stamp = new builtin_interfaces.TimeMsg { sec = (int)Time.time };
        scanMsg.header.frame_id = transform.name;
        scanMsg.angle_min = Mathf.Deg2Rad * (-fieldOfView / 2f);
        scanMsg.angle_max = Mathf.Deg2Rad * (fieldOfView / 2f);
        scanMsg.angle_increment = Mathf.Deg2Rad * (fieldOfView / rayCount);
        scanMsg.time_increment = 0;
        scanMsg.scan_time = publishInterval;
        scanMsg.range_min = 0.1f;
        scanMsg.range_max = maxDistance;
        scanMsg.ranges = ranges.ToArray();

        ros.Publish(topicName, scanMsg);
    }

    void OnDrawGizmos()
    {
        if (ranges != null)
        {
            float angleStep = fieldOfView / rayCount;
            float startAngle = -fieldOfView / 2f;

            for (int i = 0; i < rayCount; i++)
            {
                float angle = startAngle + (i * angleStep);
                Vector3 direction = Quaternion.Euler(0, angle, 0) * transform.forward;

                Gizmos.color = ranges[i] < maxDistance ? Color.red : Color.green;
                Gizmos.DrawRay(transform.position, direction * ranges[i]);
            }
        }
    }
}
```

## XR Integration for Robotics

### VR/AR for Robotics Applications

Unity's XR capabilities can be used for robotics teleoperation and visualization:

```csharp
// VRRobotController.cs
using UnityEngine;
using UnityEngine.XR;

public class VRRobotController : MonoBehaviour
{
    [Header("VR Controllers")]
    public XRNode leftControllerNode = XRNode.LeftHand;
    public XRNode rightControllerNode = XRNode.RightHand;

    [Header("Robot Control")]
    public Transform robot;
    public float teleopSpeed = 1f;

    private InputDevice leftController;
    private InputDevice rightController;

    void Start()
    {
        // Initialize controllers
        var devices = new List<InputDevice>();
        InputDevices.GetDevicesAtXRNode(leftControllerNode, devices);
        if (devices.Count > 0) leftController = devices[0];

        devices.Clear();
        InputDevices.GetDevicesAtXRNode(rightControllerNode, devices);
        if (devices.Count > 0) rightController = devices[0];
    }

    void Update()
    {
        HandleVRInput();
    }

    void HandleVRInput()
    {
        // Get controller inputs
        Vector2 leftStick = GetControllerAxis(leftController, CommonUsages.primary2DAxis);
        Vector2 rightStick = GetControllerAxis(rightController, CommonUsages.primary2DAxis);

        // Control robot with left controller
        if (robot != null)
        {
            Vector3 movement = new Vector3(leftStick.x, 0, leftStick.y) * teleopSpeed * Time.deltaTime;
            robot.Translate(movement, Space.World);

            // Rotate robot with right controller
            float rotation = rightStick.x * teleopSpeed * Time.deltaTime;
            robot.Rotate(Vector3.up, rotation);
        }
    }

    Vector2 GetControllerAxis(InputDevice device, InputFeatureUsage<Vector2> axis)
    {
        Vector2 axisValue = Vector2.zero;
        if (device.isValid)
        {
            device.TryGetFeatureValue(axis, out axisValue);
        }
        return axisValue;
    }
}
```

## Best Practices for Unity Robotics

### 1. Performance Optimization

- Use appropriate LOD (Level of Detail) systems
- Optimize physics settings for real-time performance
- Use occlusion culling for large environments
- Implement efficient rendering pipelines

### 2. Physics Configuration

- Balance accuracy with performance
- Use appropriate collision detection modes
- Configure joint limits and safety parameters
- Test with realistic mass and inertia values

### 3. ROS Integration

- Implement proper error handling for network communication
- Use appropriate message rates to avoid network congestion
- Validate data consistency between Unity and ROS
- Implement graceful degradation when connection is lost

### 4. Asset Management

- Use modular design for reusable components
- Maintain consistent coordinate systems
- Follow naming conventions for easy integration
- Document custom components and behaviors

## Troubleshooting Common Issues

### Connection Problems

If ROS TCP connection fails:
1. Verify IP address and port settings
2. Check firewall settings
3. Ensure ROS bridge is running
4. Test network connectivity separately

### Physics Issues

For unrealistic physics behavior:
1. Verify mass and inertia properties
2. Adjust solver iteration counts
3. Check joint limits and safety constraints
4. Validate collision mesh accuracy

### Performance Problems

For slow simulation:
1. Reduce rendering quality during training
2. Optimize collision meshes
3. Adjust physics update rate
4. Use simplified models for training

## Practical Example: Complete Unity Robot

Let's create a complete Unity robot with sensors and control:

### Complete Robot Setup

```csharp
// CompleteRobotSystem.cs
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry;
using Unity.MLAgents;

public class CompleteRobotSystem : MonoBehaviour
{
    [Header("ROS Configuration")]
    public string rosIP = "127.0.0.1";
    public int rosPort = 10000;

    [Header("Robot Components")]
    public Transform baseLink;
    public ArticulationBody[] wheels;
    public Camera rgbCamera;
    public CustomLidarSensor lidar;
    public RobotAgent agent;

    [Header("Control Parameters")]
    public float maxLinearSpeed = 2.0f;
    public float maxAngularSpeed = 1.5f;
    public float wheelRadius = 0.1f;
    public float wheelSeparation = 0.5f;

    private ROSConnection ros;
    private float currentLinearVel = 0f;
    private float currentAngularVel = 0f;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Initialize(rosIP, rosPort);

        // Register ROS topics
        ros.RegisterSubscriber<TwistMsg>("/cmd_vel", OnVelocityCommand);
        ros.RegisterPublisher<OdometryMsg>("/odom");
        ros.RegisterPublisher<LaserScanMsg>("/scan");

        // Initialize sensors
        if (lidar != null)
        {
            lidar.enabled = true;
        }

        Debug.Log("Complete robot system initialized");
    }

    void Update()
    {
        // Publish odometry
        PublishOdometry();

        // Apply velocity commands
        ApplyVelocityCommands();

        // Handle manual control
        HandleManualControl();
    }

    void OnVelocityCommand(TwistMsg twist)
    {
        currentLinearVel = (float)twist.linear.x;
        currentAngularVel = (float)twist.angular.z;
    }

    void ApplyVelocityCommands()
    {
        if (wheels.Length >= 2)
        {
            // Convert linear/angular velocity to wheel velocities
            float leftWheelVel = (currentLinearVel - currentAngularVel * wheelSeparation / 2) / wheelRadius;
            float rightWheelVel = (currentLinearVel + currentAngularVel * wheelSeparation / 2) / wheelRadius;

            // Apply to wheels
            wheels[0].angularVelocity = leftWheelVel; // Left wheel
            if (wheels.Length > 1)
            {
                wheels[1].angularVelocity = rightWheelVel; // Right wheel
            }
        }
    }

    void HandleManualControl()
    {
        if (Input.GetKey(KeyCode.W)) currentLinearVel = maxLinearSpeed;
        else if (Input.GetKey(KeyCode.S)) currentLinearVel = -maxLinearSpeed;
        else currentLinearVel = 0;

        if (Input.GetKey(KeyCode.A)) currentAngularVel = maxAngularSpeed;
        else if (Input.GetKey(KeyCode.D)) currentAngularVel = -maxAngularSpeed;
        else currentAngularVel = 0;
    }

    void PublishOdometry()
    {
        var odom = new OdometryMsg();
        odom.header.stamp = new builtin_interfaces.TimeMsg { sec = (int)Time.time };
        odom.header.frame_id = "odom";
        odom.child_frame_id = "base_link";

        // Position
        odom.pose.pose.position = new geometry_msgs.PointMsg
        {
            x = baseLink.position.x,
            y = baseLink.position.y,
            z = baseLink.position.z
        };

        // Orientation
        odom.pose.pose.orientation = new geometry_msgs.QuaternionMsg
        {
            x = baseLink.rotation.x,
            y = baseLink.rotation.y,
            z = baseLink.rotation.z,
            w = baseLink.rotation.w
        };

        // Velocity
        odom.twist.twist.linear = new geometry_msgs.Vector3Msg
        {
            x = currentLinearVel,
            y = 0,
            z = 0
        };

        odom.twist.twist.angular = new geometry_msgs.Vector3Msg
        {
            x = 0,
            y = 0,
            z = currentAngularVel
        };

        ros.Publish("/odom", odom);
    }
}
```

## Summary

In this chapter, we've explored Unity's capabilities for robotics simulation:
- URDF import and robot setup
- ROS TCP Connector for communication
- ML-Agents for AI training
- Physics configuration for robotics
- Custom sensor implementations
- XR integration for teleoperation

Unity provides a powerful platform for robotics with high-fidelity graphics and advanced AI capabilities. The integration with ROS enables seamless communication between Unity and the robotics ecosystem.

In the next chapter, we'll compare physics engines and discuss simulation optimization strategies.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about Unity robotics concepts or need help with setting up your own Unity robotics projects!