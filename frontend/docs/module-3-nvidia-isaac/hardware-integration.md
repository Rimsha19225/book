---
sidebar_position: 3
title: "Jetson Platform Integration"
description: "Learn how to integrate NVIDIA Isaac with Jetson platforms for edge AI robotics"
keywords: ["Jetson", "edge AI", "Isaac", "NVIDIA", "robotics", "AI", "embedded"]
---

# Jetson Platform Integration

## Introduction to NVIDIA Jetson for Robotics

The NVIDIA Jetson platform is a family of AI computing devices designed for robotics, autonomous machines, and edge AI applications. With powerful GPU-accelerated processing in a compact form factor, Jetson platforms enable real-time AI inference for robotics applications at the edge.

### Jetson Platform Overview

The Jetson family includes several models optimized for different performance and power requirements:

#### Jetson Orin Series
- **Jetson Orin AGX**: Up to 275 TOPS AI performance
- **Jetson Orin NX**: Up to 100 TOPS AI performance
- **Jetson Orin Nano**: Up to 40 TOPS AI performance

#### Jetson Xavier Series
- **Jetson AGX Xavier**: Up to 32 TOPS AI performance
- **Jetson Xavier NX**: Up to 21 TOPS AI performance

#### Jetson Nano
- **Jetson Nano**: 0.5 TOPS AI performance (entry-level)

### Key Features for Robotics

1. **GPU Acceleration**: NVIDIA GPU for parallel processing
2. **AI Framework Support**: CUDA, cuDNN, TensorRT
3. **Connectivity**: Multiple interfaces for sensors and actuators
4. **Power Efficiency**: Optimized for mobile robotics
5. **ROS Integration**: Full support for ROS/ROS 2

## Jetson Hardware Specifications

### Jetson Orin AGX (Recommended for Advanced Robotics)

- **GPU**: 2048 CUDA cores, 64 Tensor cores
- **CPU**: 12-core ARM v8.2 @ 2.0 GHz
- **Memory**: 32GB LPDDR5
- **AI Performance**: 275 TOPS (INT8)
- **Power**: 15W to 60W configurable
- **Connectivity**: PCIe Gen4 x4, 1000BASE-T Ethernet, USB 3.2

### Jetson Orin NX
- **GPU**: 1024 CUDA cores, 32 Tensor cores
- **CPU**: 8-core ARM v8.2 @ 2.2 GHz
- **Memory**: 8GB LPDDR5
- **AI Performance**: 100 TOPS (INT8)
- **Power**: 15W to 25W configurable

### Jetson Orin Nano
- **GPU**: 512 CUDA cores, 16 Tensor cores
- **CPU**: 4-core ARM v8.2 @ 2.0 GHz
- **Memory**: 4GB or 8GB LPDDR5
- **AI Performance**: 40 TOPS (INT8)
- **Power**: 7W to 15W configurable

## Jetpack SDK and Development Environment

### Jetpack Overview

Jetpack is the complete SDK for Jetson platforms, including:
- **Linux OS**: Ubuntu-based with real-time kernel options
- **CUDA Toolkit**: GPU computing platform
- **cuDNN**: Deep neural network primitives
- **TensorRT**: High-performance inference optimizer
- **VisionWorks**: Computer vision libraries
- **Isaac ROS**: Hardware-accelerated ROS packages

### Installing Jetpack

#### Method 1: SDK Manager (Recommended)
```bash
# Download and install NVIDIA SDK Manager
# This provides a GUI for flashing Jetson devices
wget https://developer.download.nvidia.com/embedded/jetpack-sdk-manager/SDKManager_1.10.0_amd64.deb
sudo dpkg -i SDKManager_1.10.0_amd64.deb
```

#### Method 2: Manual Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install CUDA
sudo apt install cuda-toolkit-11-4

# Install cuDNN
sudo apt install libcudnn8 libcudnn8-dev

# Install TensorRT
sudo apt install libnvinfer8 libnvinfer-dev libnvparsers8 libnvonnxparsers8
```

### Development Environment Setup

```bash
# Install ROS 2 Humble for Jetson
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update
sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-humble-ros-base
```

## Isaac ROS on Jetson

### Installing Isaac ROS Packages

```bash
# Add NVIDIA Isaac ROS repository
curl -sSL https://repo.download.nvidia.com/jetson-agx-xavier-32.7.1 | sudo apt-key add -
sudo add-apt-repository "deb https://repo.download.nvidia.com/jetson-agx-xavier-32.7.1 main"

# Update and install Isaac ROS packages
sudo apt update
sudo apt install ros-humble-isaac-ros-* ros-humble-isaac-ros-gems
```

### Hardware-Accelerated Packages

Isaac ROS provides several hardware-accelerated packages optimized for Jetson:

#### Isaac ROS Image Pipeline
```python
# accelerated_image_pipeline.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import numpy as np
import cv2

class AcceleratedImageProcessor(Node):
    def __init__(self):
        super().__init__('accelerated_image_processor')

        # Subscribe to camera feed
        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        # Publisher for processed image
        self.publisher = self.create_publisher(
            Image,
            '/camera/image_processed',
            10
        )

        self.bridge = CvBridge()

    def image_callback(self, msg):
        # Convert ROS image to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

        # Apply hardware-accelerated processing
        # This would use CUDA kernels in a real Isaac ROS implementation
        processed_image = self.apply_gpu_processing(cv_image)

        # Convert back to ROS message
        processed_msg = self.bridge.cv2_to_imgmsg(processed_image, encoding='bgr8')
        self.publisher.publish(processed_msg)

    def apply_gpu_processing(self, image):
        # In a real implementation, this would use CUDA/GPU acceleration
        # For example, using PyCUDA or TensorRT for optimized operations
        return cv2.Canny(image, 100, 200)

def main(args=None):
    rclpy.init(args=args)
    processor = AcceleratedImageProcessor()
    rclpy.spin(processor)
    processor.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### Isaac ROS AprilTag Detection
```python
# apriltag_detector.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from geometry_msgs.msg import PoseArray
from cv_bridge import CvBridge
import numpy as np

class AprilTagDetector(Node):
    def __init__(self):
        super().__init__('apriltag_detector')

        # Subscribe to camera feed
        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        # Publisher for detected tags
        self.publisher = self.create_publisher(
            PoseArray,
            '/apriltag_detections',
            10
        )

        self.bridge = CvBridge()

        # AprilTag family (typically 36h11 for 6x6 tags)
        self.tag_family = "tag36h11"

    def image_callback(self, msg):
        # Convert ROS image to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='mono8')

        # Detect AprilTags using hardware acceleration
        # This would use Isaac ROS's GPU-accelerated AprilTag detection
        detections = self.detect_apriltags_hardware_accelerated(cv_image)

        # Publish detections
        if detections:
            pose_array = self.create_pose_array(detections)
            self.publisher.publish(pose_array)

    def detect_apriltags_hardware_accelerated(self, image):
        # Placeholder for actual hardware-accelerated detection
        # In Isaac ROS, this would use CUDA kernels for detection
        # which is significantly faster than CPU-based detection
        pass

    def create_pose_array(self, detections):
        # Create PoseArray message with detected tag poses
        pose_array = PoseArray()
        pose_array.header.stamp = self.get_clock().now().to_msg()
        pose_array.header.frame_id = "camera_frame"

        # Convert detections to poses
        for detection in detections:
            pose = detection.pose  # Simplified
            pose_array.poses.append(pose)

        return pose_array

def main(args=None):
    rclpy.init(args=args)
    detector = AprilTagDetector()
    rclpy.spin(detector)
    detector.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Power Management and Thermal Considerations

### Power Configuration

Jetson platforms support configurable power modes:

```bash
# Check current power mode
sudo tegrastats

# Set power mode (example for Jetson Orin AGX)
sudo nvpmodel -m 0  # Maximum performance mode
sudo jetson_clocks  # Lock clocks to maximum

# For power-efficient operation
sudo nvpmodel -m 1  # Low power mode
```

### Thermal Management

```python
# thermal_monitor.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32
import subprocess
import re

class ThermalMonitor(Node):
    def __init__(self):
        super().__init__('thermal_monitor')

        self.temperature_pub = self.create_publisher(Float32, '/system_temperature', 10)
        self.power_pub = self.create_publisher(Float32, '/system_power', 10)

        # Timer to periodically check thermal status
        self.timer = self.create_timer(1.0, self.check_thermal_status)

    def check_thermal_status(self):
        # Read thermal zones
        try:
            # Get GPU temperature
            result = subprocess.run(['cat', '/sys/class/thermal/thermal_zone1/temp'],
                                  capture_output=True, text=True)
            gpu_temp = float(result.stdout.strip()) / 1000.0  # Convert from millidegrees

            # Get CPU temperature
            result = subprocess.run(['cat', '/sys/class/thermal/thermal_zone0/temp'],
                                  capture_output=True, text=True)
            cpu_temp = float(result.stdout.strip()) / 1000.0

            # Publish max temperature
            temp_msg = Float32()
            temp_msg.data = max(gpu_temp, cpu_temp)
            self.temperature_pub.publish(temp_msg)

            self.get_logger().info(f'Temperature: CPU={cpu_temp:.1f}°C, GPU={gpu_temp:.1f}°C')

        except Exception as e:
            self.get_logger().error(f'Error reading thermal data: {e}')

def main(args=None):
    rclpy.init(args=args)
    monitor = ThermalMonitor()
    rclpy.spin(monitor)
    monitor.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Dynamic Power Management

```python
# power_manager.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import subprocess

class PowerManager(Node):
    def __init__(self):
        super().__init__('power_manager')

        self.power_mode_sub = self.create_subscription(
            String,
            '/power_mode_command',
            self.power_mode_callback,
            10
        )

        self.current_mode = "balanced"
        self.get_logger().info('Power manager initialized')

    def power_mode_callback(self, msg):
        mode = msg.data.lower()

        if mode == "performance":
            self.set_performance_mode()
        elif mode == "power_saving":
            self.set_power_saving_mode()
        elif mode == "balanced":
            self.set_balanced_mode()
        else:
            self.get_logger().warn(f'Unknown power mode: {mode}')
            return

        self.current_mode = mode
        self.get_logger().info(f'Power mode set to: {mode}')

    def set_performance_mode(self):
        """Set maximum performance mode"""
        try:
            subprocess.run(['sudo', 'nvpmodel', '-m', '0'], check=True)
            subprocess.run(['sudo', 'jetson_clocks'], check=True)
            self.get_logger().info('Set to maximum performance mode')
        except subprocess.CalledProcessError as e:
            self.get_logger().error(f'Failed to set performance mode: {e}')

    def set_power_saving_mode(self):
        """Set power saving mode"""
        try:
            subprocess.run(['sudo', 'nvpmodel', '-m', '1'], check=True)
            self.get_logger().info('Set to power saving mode')
        except subprocess.CalledProcessError as e:
            self.get_logger().error(f'Failed to set power saving mode: {e}')

    def set_balanced_mode(self):
        """Set balanced mode"""
        try:
            subprocess.run(['sudo', 'nvpmodel', '-m', '2'], check=True)
            self.get_logger().info('Set to balanced mode')
        except subprocess.CalledProcessError as e:
            self.get_logger().error(f'Failed to set balanced mode: {e}')

def main(args=None):
    rclpy.init(args=args)
    manager = PowerManager()
    rclpy.spin(manager)
    manager.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Sensor Integration on Jetson

### Camera Interface

Jetson platforms support multiple camera interfaces:

#### MIPI CSI-2 Cameras
```python
# mipi_camera_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class MIPICameraNode(Node):
    def __init__(self):
        super().__init__('mipi_camera_node')

        self.publisher = self.create_publisher(Image, '/camera/image_raw', 10)
        self.bridge = CvBridge()

        # Initialize MIPI CSI-2 camera
        # Using GStreamer pipeline for MIPI cameras on Jetson
        self.pipeline = (
            "nvarguscamerasrc sensor-id=0 ! "
            "video/x-raw(memory:NVMM), width=1920, height=1080, format=NV12, framerate=30/1 ! "
            "nvvidconv flip-method=0 ! "
            "video/x-raw, width=1920, height=1080, format=BGRx ! "
            "videoconvert ! "
            "video/x-raw, format=BGR ! appsink"
        )

        self.cap = cv2.VideoCapture(self.pipeline, cv2.CAP_GSTREAMER)

        if not self.cap.isOpened():
            self.get_logger().error('Failed to open MIPI camera')
            return

        # Timer for capturing frames
        self.timer = self.create_timer(0.033, self.capture_frame)  # ~30 FPS
        self.get_logger().info('MIPI camera initialized')

    def capture_frame(self):
        ret, frame = self.cap.read()
        if ret:
            # Convert frame to ROS Image message
            img_msg = self.bridge.cv2_to_imgmsg(frame, encoding='bgr8')
            img_msg.header.stamp = self.get_clock().now().to_msg()
            img_msg.header.frame_id = 'camera_frame'

            self.publisher.publish(img_msg)
        else:
            self.get_logger().warn('Failed to capture frame from MIPI camera')

    def destroy_node(self):
        if hasattr(self, 'cap'):
            self.cap.release()
        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)
    camera_node = MIPICameraNode()
    rclpy.spin(camera_node)
    camera_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### USB Cameras
```python
# usb_camera_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class USBCameraNode(Node):
    def __init__(self):
        super().__init__('usb_camera_node')

        self.publisher = self.create_publisher(Image, '/usb_camera/image_raw', 10)
        self.bridge = CvBridge()

        # Initialize USB camera (typically /dev/video0, /dev/video1, etc.)
        self.cap = cv2.VideoCapture(0)

        # Set camera properties for Jetson optimization
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)

        if not self.cap.isOpened():
            self.get_logger().error('Failed to open USB camera')
            return

        # Timer for capturing frames
        self.timer = self.create_timer(0.033, self.capture_frame)  # ~30 FPS
        self.get_logger().info('USB camera initialized')

    def capture_frame(self):
        ret, frame = self.cap.read()
        if ret:
            # Convert frame to ROS Image message
            img_msg = self.bridge.cv2_to_imgmsg(frame, encoding='bgr8')
            img_msg.header.stamp = self.get_clock().now().to_msg()
            img_msg.header.frame_id = 'usb_camera_frame'

            self.publisher.publish(img_msg)
        else:
            self.get_logger().warn('Failed to capture frame from USB camera')

    def destroy_node(self):
        if hasattr(self, 'cap'):
            self.cap.release()
        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)
    camera_node = USBCameraNode()
    rclpy.spin(camera_node)
    camera_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### LIDAR Integration

```python
# lidar_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
import serial
import math

class LIDARNNode(Node):
    def __init__(self):
        super().__init__('lidar_node')

        self.publisher = self.create_publisher(LaserScan, '/scan', 10)

        # Initialize LIDAR (example for RPLIDAR)
        try:
            self.lidar_serial = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)
            self.get_logger().info('LIDAR connected on /dev/ttyUSB0')
        except serial.SerialException:
            self.get_logger().error('Failed to connect to LIDAR')
            self.lidar_serial = None
            return

        # Timer for reading LIDAR data
        self.timer = self.create_timer(0.1, self.read_lidar_data)
        self.get_logger().info('LIDAR node initialized')

    def read_lidar_data(self):
        if not self.lidar_serial:
            return

        try:
            # Read LIDAR scan data (implementation depends on specific LIDAR model)
            # This is a simplified example - actual implementation varies by LIDAR
            scan_data = self.get_scan_data()

            if scan_data:
                scan_msg = LaserScan()
                scan_msg.header.stamp = self.get_clock().now().to_msg()
                scan_msg.header.frame_id = 'lidar_frame'

                # Set scan parameters
                scan_msg.angle_min = -math.pi
                scan_msg.angle_max = math.pi
                scan_msg.angle_increment = 2 * math.pi / len(scan_data)
                scan_msg.time_increment = 0.0  # Calculated based on LIDAR RPM
                scan_msg.scan_time = 0.1  # 100ms per full scan
                scan_msg.range_min = 0.15  # Minimum range for RPLIDAR A1
                scan_msg.range_max = 6.0   # Maximum range for RPLIDAR A1
                scan_msg.ranges = scan_data

                self.publisher.publish(scan_msg)

        except Exception as e:
            self.get_logger().error(f'Error reading LIDAR data: {e}')

    def get_scan_data(self):
        # Placeholder for actual LIDAR data reading
        # Implementation depends on specific LIDAR model and protocol
        # This would typically involve parsing binary data from the LIDAR
        pass

    def destroy_node(self):
        if hasattr(self, 'lidar_serial') and self.lidar_serial:
            self.lidar_serial.close()
        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)
    lidar_node = LIDARNNode()
    rclpy.spin(lidar_node)
    lidar_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## AI Inference on Jetson

### TensorRT Optimization

```python
# tensorrt_inference.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from std_msgs.msg import String
from cv_bridge import CvBridge
import tensorrt as trt
import pycuda.driver as cuda
import pycuda.autoinit
import numpy as np
import cv2

class TensorRTInferenceNode(Node):
    def __init__(self):
        super().__init__('tensorrt_inference_node')

        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        self.result_publisher = self.create_publisher(
            String,
            '/inference_result',
            10
        )

        self.bridge = CvBridge()

        # Initialize TensorRT engine
        self.engine = self.load_tensorrt_engine('/path/to/model.plan')
        self.context = self.engine.create_execution_context()

        # Allocate buffers
        self.allocate_buffers()

        self.get_logger().info('TensorRT inference node initialized')

    def load_tensorrt_engine(self, engine_path):
        """Load TensorRT engine from file"""
        with open(engine_path, 'rb') as f:
            engine_data = f.read()

        runtime = trt.Runtime(trt.Logger(trt.Logger.WARNING))
        engine = runtime.deserialize_cuda_engine(engine_data)

        return engine

    def allocate_buffers(self):
        """Allocate input and output buffers for TensorRT"""
        # Get input and output bindings
        self.input_binding = -1
        self.output_binding = -1

        for binding in self.engine:
            if self.engine.get_tensor_mode(binding) == trt.TensorIOMode.INPUT:
                self.input_binding = binding
            else:
                self.output_binding = binding

        # Allocate CUDA memory
        input_shape = self.engine.get_tensor_shape(self.input_binding)
        output_shape = self.engine.get_tensor_shape(self.output_binding)

        self.input_size = trt.volume(input_shape) * self.engine.max_batch_size * np.dtype(np.float32).itemsize
        self.output_size = trt.volume(output_shape) * self.engine.max_batch_size * np.dtype(np.float32).itemsize

        self.d_input = cuda.mem_alloc(self.input_size)
        self.d_output = cuda.mem_alloc(self.output_size)

        self.h_output = cuda.pagelocked_empty(self.output_size // np.dtype(np.float32).itemsize, dtype=np.float32)
        self.h_input = cuda.pagelocked_empty(self.input_size // np.dtype(np.float32).itemsize, dtype=np.float32)

    def image_callback(self, msg):
        """Process incoming image and run inference"""
        try:
            # Convert ROS image to OpenCV
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Preprocess image for inference
            input_tensor = self.preprocess_image(cv_image)

            # Copy input to GPU
            np.copyto(self.h_input, input_tensor.ravel())
            cuda.memcpy_htod(self.d_input, self.h_input)

            # Run inference
            self.context.execute_v2(bindings=[int(self.d_input), int(self.d_output)])

            # Copy output from GPU
            cuda.memcpy_dtoh(self.h_output, self.d_output)

            # Process results
            result = self.postprocess_output(self.h_output)

            # Publish results
            result_msg = String()
            result_msg.data = str(result)
            self.result_publisher.publish(result_msg)

        except Exception as e:
            self.get_logger().error(f'Inference error: {e}')

    def preprocess_image(self, image):
        """Preprocess image for the model"""
        # Resize image to model input size (e.g., 224x224 for ResNet)
        input_height, input_width = 224, 224
        image = cv2.resize(image, (input_width, input_height))

        # Normalize image
        image = image.astype(np.float32) / 255.0

        # Convert BGR to RGB and transpose to CHW format
        image = image[:, :, ::-1].transpose((2, 0, 1))

        return image

    def postprocess_output(self, output):
        """Postprocess inference output"""
        # Example: Get class with highest probability
        probabilities = output
        predicted_class = np.argmax(probabilities)

        return {
            'class_id': int(predicted_class),
            'confidence': float(probabilities[predicted_class]),
            'all_probabilities': probabilities.tolist()
        }

def main(args=None):
    rclpy.init(args=args)
    inference_node = TensorRTInferenceNode()
    rclpy.spin(inference_node)
    inference_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Deep Learning Model Deployment

```python
# model_deployer.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import subprocess
import os

class ModelDeployer(Node):
    def __init__(self):
        super().__init__('model_deployer')

        self.deployment_sub = self.create_subscription(
            String,
            '/model_deployment_command',
            self.deployment_callback,
            10
        )

        self.status_publisher = self.create_publisher(
            String,
            '/model_deployment_status',
            10
        )

        self.model_dir = '/opt/jetson/models'
        os.makedirs(self.model_dir, exist_ok=True)

        self.get_logger().info('Model deployer initialized')

    def deployment_callback(self, msg):
        """Handle model deployment commands"""
        try:
            command = msg.data
            self.get_logger().info(f'Received deployment command: {command}')

            if command.startswith('deploy:'):
                model_url = command.split(':', 1)[1]
                self.deploy_model(model_url)
            elif command.startswith('optimize:'):
                model_path = command.split(':', 1)[1]
                self.optimize_model_for_jetson(model_path)
            elif command == 'list_models':
                self.list_models()
            else:
                self.get_logger().warn(f'Unknown deployment command: {command}')

        except Exception as e:
            self.get_logger().error(f'Deployment error: {e}')
            status_msg = String()
            status_msg.data = f'error: {str(e)}'
            self.status_publisher.publish(status_msg)

    def deploy_model(self, model_url):
        """Deploy model from URL"""
        try:
            model_name = os.path.basename(model_url).split('.')[0]
            local_path = os.path.join(self.model_dir, f'{model_name}.onnx')

            # Download model
            self.get_logger().info(f'Downloading model from {model_url}')
            subprocess.run(['wget', model_url, '-O', local_path], check=True)

            # Optimize for Jetson
            self.optimize_model_for_jetson(local_path)

            status_msg = String()
            status_msg.data = f'success: deployed {model_name}'
            self.status_publisher.publish(status_msg)

        except subprocess.CalledProcessError as e:
            self.get_logger().error(f'Download failed: {e}')
            status_msg = String()
            status_msg.data = f'error: download failed - {str(e)}'
            self.status_publisher.publish(status_msg)

    def optimize_model_for_jetson(self, model_path):
        """Optimize model using TensorRT"""
        try:
            model_name = os.path.splitext(os.path.basename(model_path))[0]
            engine_path = os.path.join(self.model_dir, f'{model_name}.plan')

            self.get_logger().info(f'Optimizing model {model_path} for TensorRT')

            # Use TensorRT optimization (simplified example)
            # In practice, this would involve more complex optimization steps
            import tensorrt as trt
            from torch2trt import torch2trt

            # This is a placeholder - actual optimization would depend on model format
            self.get_logger().info(f'Model optimized: {engine_path}')

        except Exception as e:
            self.get_logger().error(f'Optimization failed: {e}')

    def list_models(self):
        """List deployed models"""
        try:
            models = [f for f in os.listdir(self.model_dir) if f.endswith(('.onnx', '.plan', '.trt'))]

            status_msg = String()
            status_msg.data = f'models: {", ".join(models)}'
            self.status_publisher.publish(status_msg)

        except Exception as e:
            self.get_logger().error(f'Listing models failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    deployer = ModelDeployer()
    rclpy.spin(deployer)
    deployer.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Performance Optimization

### GPU Utilization Monitoring

```python
# gpu_monitor.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import subprocess
import json

class GPUMonitor(Node):
    def __init__(self):
        super().__init__('gpu_monitor')

        self.gpu_status_pub = self.create_publisher(String, '/gpu_status', 10)

        # Timer to periodically check GPU status
        self.timer = self.create_timer(1.0, self.check_gpu_status)

    def check_gpu_status(self):
        """Check GPU utilization and memory usage"""
        try:
            # Use nvidia-ml-py or tegrastats to get GPU info
            result = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total',
                                   '--format=csv,noheader,nounits'],
                                  capture_output=True, text=True)

            if result.returncode == 0:
                gpu_info = result.stdout.strip().split(', ')
                gpu_util = int(gpu_info[0])  # GPU utilization percentage
                mem_used = int(gpu_info[1])  # Memory used in MB
                mem_total = int(gpu_info[2])  # Memory total in MB
                mem_util = (mem_used / mem_total) * 100 if mem_total > 0 else 0

                status_data = {
                    'gpu_utilization': gpu_util,
                    'memory_used': mem_used,
                    'memory_total': mem_total,
                    'memory_utilization': round(mem_util, 2)
                }

                status_msg = String()
                status_msg.data = json.dumps(status_data)
                self.gpu_status_pub.publish(status_msg)

                self.get_logger().info(f'GPU: {gpu_util}% util, Memory: {mem_util:.1f}% util')
            else:
                self.get_logger().error('Failed to get GPU status')

        except Exception as e:
            self.get_logger().error(f'GPU monitoring error: {e}')

def main(args=None):
    rclpy.init(args=args)
    monitor = GPUMonitor()
    rclpy.spin(monitor)
    monitor.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Resource Management

```python
# resource_manager.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import psutil
import subprocess

class ResourceManager(Node):
    def __init__(self):
        super().__init__('resource_manager')

        self.resource_pub = self.create_publisher(String, '/system_resources', 10)
        self.command_sub = self.create_subscription(
            String,
            '/resource_command',
            self.command_callback,
            10
        )

        # Timer to monitor resources
        self.timer = self.create_timer(2.0, self.monitor_resources)

    def monitor_resources(self):
        """Monitor system resources"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        disk_percent = psutil.disk_usage('/').percent

        # Get Jetson-specific info
        jetson_info = self.get_jetson_info()

        resource_data = {
            'cpu_percent': cpu_percent,
            'memory_percent': memory_percent,
            'disk_percent': disk_percent,
            'jetson_info': jetson_info
        }

        resource_msg = String()
        resource_msg.data = str(resource_data)
        self.resource_pub.publish(resource_msg)

    def get_jetson_info(self):
        """Get Jetson-specific system information"""
        try:
            # Get Jetson model
            with open('/proc/device-tree/model', 'r') as f:
                model = f.read().strip().replace('\x00', '')

            # Get Jetson version info
            result = subprocess.run(['sudo', 'cat', '/etc/nv_tegra_release'],
                                  capture_output=True, text=True)
            version = result.stdout.strip() if result.returncode == 0 else 'Unknown'

            return {
                'model': model,
                'version': version
            }
        except Exception:
            return {'model': 'Unknown', 'version': 'Unknown'}

    def command_callback(self, msg):
        """Handle resource management commands"""
        command = msg.data.lower()

        if command == 'power_mode':
            # Get current power mode
            try:
                result = subprocess.run(['sudo', 'nvpmodel', '-q'],
                                      capture_output=True, text=True)
                self.get_logger().info(f'Power mode: {result.stdout}')
            except Exception as e:
                self.get_logger().error(f'Failed to get power mode: {e}')

def main(args=None):
    rclpy.init(args=args)
    manager = ResourceManager()
    rclpy.spin(manager)
    manager.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Best Practices for Jetson Robotics

### 1. Power Management
- Use appropriate power modes for your application
- Monitor thermal conditions during operation
- Implement thermal protection mechanisms
- Balance performance with power consumption

### 2. Memory Management
- Monitor memory usage regularly
- Use memory-efficient data structures
- Implement proper cleanup of large objects
- Consider using memory pools for frequently allocated objects

### 3. AI Model Optimization
- Use TensorRT for inference optimization
- Quantize models to INT8 when possible
- Optimize batch sizes for your use case
- Profile models to identify bottlenecks

### 4. Real-time Considerations
- Use real-time kernel when deterministic behavior is required
- Prioritize critical tasks appropriately
- Monitor system load during operation
- Implement watchdog mechanisms for critical functions

## Troubleshooting Common Issues

### Performance Issues
- Check GPU utilization with `tegrastats`
- Verify power mode settings
- Monitor thermal throttling
- Profile applications for bottlenecks

### Hardware Interface Problems
- Verify sensor connections and power
- Check device permissions (`/dev` access)
- Validate communication protocols
- Test sensors independently

### AI Inference Problems
- Verify model compatibility with Jetson
- Check TensorRT optimization
- Validate input data format
- Monitor memory usage during inference

## Summary

In this chapter, we've explored Jetson platform integration:
- Hardware specifications and capabilities
- Jetpack SDK installation and setup
- Isaac ROS packages and acceleration
- Power and thermal management
- Sensor integration (cameras, LIDAR)
- AI inference with TensorRT
- Performance optimization strategies

The Jetson platform provides powerful edge AI capabilities for robotics applications. Understanding these integration techniques is essential for deploying AI-powered robots in real-world scenarios.

In the next chapter, we'll explore AI workflows and deep learning applications on Jetson platforms.

Use the AI assistant (click the blue button in the bottom-right) if you have questions about Jetson integration or need help with deploying your own Jetson-powered robotics applications!