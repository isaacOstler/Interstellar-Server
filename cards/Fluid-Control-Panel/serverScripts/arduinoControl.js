
SerialPort.list(function (err, ports) {
	ports.forEach(function(portFound) {
		if(portFound.manufacturer == "Arduino__www.arduino.cc_"){
			startSerialConnection(portFound.comName);
		}
	});
});

function startSerialConnection(comName){
	var port = new SerialPort(comName, {
		baudRate: 9600
	});

	port.on('open', function() {
		console.log("Connected to port!");
		onDatabaseValueChange("coolant.coolantInMainTank",function(newData){
			if(newData == null){
				return;
			}
			console.log(newData.toString().error);
			turnOffAllLEDS();
			if(newData > .5){
				port.write("e", function(err) {
					if (err) {
						return console.log('Error on write: ', err.message);
					}
				});
			}else if (newData > .1) { 

				port.write("c", function(err) {
					if (err) {
						return console.log('Error on write: ', err.message);
					}
				});
			}else{
				port.write("a", function(err) {
					if (err) {
						return console.log('Error on write: ', err.message);
					}
				});
			}
		});
	});

	// open errors will be emitted as an error event 
	port.on('error', function(err) {
		console.log('Error: ', err.message);
	});

	function turnOffAllLEDS(){
		port.write("f", function(err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
		});
		port.write("d", function(err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
		});
		port.write("b", function(err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
		});
	}
}