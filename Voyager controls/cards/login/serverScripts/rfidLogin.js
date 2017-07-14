/*var SerialPort = require('serialport');
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
  });
});*/
/*
var port = new SerialPort("/dev/cu.usbmodem1421", {
	baudRate: 9600,
	parser: SerialPort.parsers.readline('\n')
});

Interstellar.onDatabaseValueChange("arduinoTestVar",function(newData){
	if(newData == null){
		setDatabaseValue("arduinoTestVar",0);
		return;
	}
	console.log(newData + " (message to write to arduino)");
	port.write(newData, function(err) {
		if (err) {
			return console.log('Error on write: ', err.message);
		}
		console.log('message written');
	});
});

port.on('data', function (data) {
	console.log('Data: ' + data);
});*/
/*
var midi = require('midi');
 
// Set up a new input. 
var input = new midi.input();
 
// Count the available input ports. 
input.getPortCount();
 
// Get the name of a specified input port. 
input.getPortName(0);
 
// Configure a callback. 
input.on('message', function(deltaTime, message) {
  // The message is an array of numbers corresponding to the MIDI bytes: 
  //   [status, data1, data2] 
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful 
  // information interpreting the messages. 
  console.log('m:' + message + ' d:' + deltaTime);
});
 
// Open the first available input port. 
input.openPort(0);*/