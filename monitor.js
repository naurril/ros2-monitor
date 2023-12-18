var ros = new ROSLIB.Ros();
ros.on('error', function (error) {
    document.getElementById('info').innerHTML = error
    console.log(error);
});

ros.on('connection', function () {
    document.getElementById('info').innerHTML = "ws server connected"
});

ros.on('close', function () {
    document.getElementById('info').innerHTML = "ws server closed"
});

ros.connect('ws://localhost:20000');



function drawScatter(cfg) {

    const color = [
        'rgb(0, 192, 192)',
        'rgb(0, 0, 192)'
    ]
    const ctx = document.getElementById(cfg.ui);

    let labels = []

    const data = {
        labels: labels,
        datasets: cfg.data.map((d, i) => {
            return {
                label: d.label,
                data: d.data,
                backgroundColor: d.color ? d.color : color[i],
            }
        }),
    };

    cfg.data = data


    return new Chart(ctx, cfg);
}


listeningTopics = {}


function subscribeTopic(topic, func) {

    if (!listeningTopics[topic.name]) {
        listeningTopics[topic.name] = []

        let listener = new ROSLIB.Topic(topic);
        console.log("start listening", topic.name)
        listener.subscribe(message => {
            listeningTopics[topic.name].forEach(func => {
                func(message);
            })
        })
    }

    listeningTopics[topic.name].push(func)
}



function setupGraph(config) {

    config.data = config.topics.map(topic => {
        return {
            label: topic.label,
            data: []
        }
    })

    config.chart = drawScatter(config)

    config.topics.forEach((t, i) => {
        let listener = new ROSLIB.Topic(t.topic);

        subscribeTopic(t.topic, (message) => {
            let d = config.data.datasets[i]
            if (d.data.length > 100) {
                d.data.shift()
            }
            d.data.push(t.extraceValue(message))
            config.chart.update()
        })
    });

    window.cfg.push(config)

}

window.cfg = []
setupGraph(
    {
        ui: "chart1",
        topics: [{
            topic: {
                ros: ros,
                name: '/control/command/control_cmd',
                messageType: 'autoware_auto_control_msgs/msg/AckermannControlCommand',
            },

            extraceValue: message => {
                return {
                    x: Date.now(),
                    y: message.lateral.steering_tire_angle,
                }
            },

            label: "steering cmd"
        },
        {
            topic: {
                ros: ros,
                name: '/vehicle/status/steering_status',
                messageType: 'autoware_auto_vehicle_msgs/msg/SteeringReport',
            },
            extraceValue: message => {
                return {
                    x: Date.now(),
                    y: message.steering_tire_angle,
                }
            },
            label: "steering status"
        },
        ],

        // these are use for chart itself
        type: 'scatter',
        options: {
            scales: {
                //   x: {
                //     type: 'linear',
                //     position: 'bottom'
                //   },
            },
            animation: false
        }

    }
)


setupGraph({
    ui: 'chart2',
    topics: [{
        topic: {
            ros: ros,
            name: '/control/command/control_cmd',
            messageType: 'autoware_auto_control_msgs/msg/AckermannControlCommand',
        },

        extraceValue: message => {
            return {
                x: Date.now(),
                y: message.longitudinal.speed
            }
        },
        label: "speed cmd"
    },
    {
        topic: {
            ros: ros,
            name: '/vehicle/status/velocity_status',
            messageType: 'autoware_auto_vehicle_msgs/msg/VelocityReport',
        },
        extraceValue: message => {
            return {
                x: Date.now(),
                y: message.longitudinal_velocity
            }
        },

        label: "speed status"
    }],

      // these are use for chart itself
      type: 'scatter',
      options: {
          scales: {
              //   x: {
              //     type: 'linear',
              //     position: 'bottom'
              //   },
          },
          animation: false
      }
}
)

// setupGraph('chart3', {
//     topic: {
//         ros: ros,
//         name: '/control/command/control_cmd',
//         messageType: 'autoware_auto_control_msgs/msg/AckermannControlCommand',
//     },

//     extraceValue: message => message.longitudinal.acceleration,
//     label: "accel cmd"
// },
//     {
//         topic: {
//             ros: ros,
//             name: '/localization/acceleration',
//             messageType: 'geometry_msgs/msg/AccelWithCovarianceStamped',
//         },
//         extraceValue: message => message.accel.accel.linear.x,
//         label: "accel status"
//     })