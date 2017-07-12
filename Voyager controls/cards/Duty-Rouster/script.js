var listOfJobs = {};
$.getJSON('/resource?path=public/jobs.json', function(data) {
	listOfJobs = data.jobs;

	//sort by job name
	listOfJobs.sort(function(a, b) {
  		var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  		var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  		if (nameA < nameB) {
  			return -1;
 		 }
  		if (nameA > nameB) {
  			return 1;
  		}

  		// names must be equal
  		return 0;
	});
	$("#jobsList").html("");
	$("#jobsList").append("<tr><th>JOB NAME</th><th>LOCATION</th><th>OFFICER ASSIGNED</th></tr>");
	for(var i = 0; i < listOfJobs.length;i++){
		var officer = listOfJobs[i].officer.toUpperCase();
		if(listOfJobs[i].officer == ""){
			officer = "<span style=\"color:red\"><b>NONE</b></span>"
		}
		$("#jobsList").append("<tr><td>" + listOfJobs[i].name.toUpperCase() + "</td><td>" + listOfJobs[i].location.toUpperCase() + "</td><td>" + officer + " <span class=\"wideButton RelieveOfficerFromDutyButton\" style=\"padding-left: 15px;padding-right: 15px;background-color:red;display: none\">RELIEVE FROM DUTY</span></td></tr>");
	}
});