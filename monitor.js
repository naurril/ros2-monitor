var ros = new ROSLIB.Ros();

// If there is an error on the backend, an 'error' emit will be emitted.
ros.on('error', function (error) {
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    console.log(error);
});

// Find out exactly when we made a connection.
ros.on('connection', function () {
    console.log('Connection made!');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('closed').style.display = 'none';
    document.getElementById('connected').style.display = 'inline';
});

ros.on('close', function () {
    console.log('Connection closed.');
    document.getElementById('connecting').style.display = 'none';
    document.getElementById('connected').style.display = 'none';
    document.getElementById('closed').style.display = 'inline';
});

// Create a connection to the rosbridge WebSocket server.
ros.connect('ws://localhost:19090');

const ctx = document.getElementById('chart1');

let labels = []
let data1 = []
let data2 = []
const data = {
    labels: labels,
    datasets: [{
        label: 'steering angle cmd',
        data: data1,
        // fill: false,
        // borderColor: 'rgb(0, 192, 192)',
        backgroundColor: 'rgb(0, 0, 192)',
        // tension: 0.1
    },
    {
        label: 'steering angle status',
        data: data2,
        // fill: false,
        // borderColor: 'rgb(0, 192, 192)',
        backgroundColor: 'rgb(192, 0, 0)',
        // tension: 0.1
    }
]
};

const config = {
    type: 'scatter',
    data: data,
    options: {
        scales: {
        //   x: {
        //     type: 'linear',
        //     position: 'bottom'
        //   },
        },
        animation: false
      }
};

let chart = new Chart(ctx, config);

// Like when publishing a topic, we first create a Topic object with details of the topic's name
// and message type. Note that we can call publish or subscribe on the same topic object.
var listener = new ROSLIB.Topic({
    ros: ros,
    name: '/control/command/control_cmd',
    messageType: 'autoware_auto_control_msgs/msg/AckermannControlCommand'
});

// Then we add a callback to be called every time a message is published on this topic.
listener.subscribe(function (message) {
    //console.log(listener.name, message);
    let ts = message.stamp.sec + message.stamp.nanosec * 1e-9;

    if (data1.length > 500) {
        // listener.unsubscribe();
        data1.shift()
    }

    // labels.push(Math.round(ts*10))
    data1.push({x:ts, y:message.lateral.steering_tire_angle})
    chart.update()
    // If desired, we can unsubscribe from the topic as well.
    
});


var listener2 = new ROSLIB.Topic({
    ros: ros,
    name: '/vehicle/status/steering_status',
    messageType: 'autoware_auto_vehicle_msgs/msg/SteeringReport'
});

listener2.subscribe(function (message) {
    //console.log(listener.name, message);
    let ts = message.stamp.sec + message.stamp.nanosec * 1e-9;

    if (data2.length > 500) {
        // listener.unsubscribe();
        data2.shift()
    }

    // labels.push(Math.round(ts*10))
    data2.push({x:ts, y: message.steering_tire_angle})
    chart.update()
    // If desired, we can unsubscribe from the topic as well.
    
})