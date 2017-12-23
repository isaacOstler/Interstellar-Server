//DOM References
var canvas = $("#canvas");

//variables
var gridWidth = 60,
	gridHeight = 60,
	worldMap = [[{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}],[{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"closed"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"},{"state":"open"}]],
	cellWidth,
	cellHeight,
	devDrawMode = false,
	drawBounds = false,
	currentDeck = 0,

	safeWanderPoints = [{"x" : 43,"y" : 5},{"x" : 33,"y" : 8},{"x" : 34,"y" : 37},{"x" : 30,"y" : 29},{"x" : 55,"y" : 36},{"x" : 6,"y" : 33},{"x" : 18,"y" : 27},{"x" : 18,"y" : 7},{"x" : 1,"y" : 17},{"x" : 3,"y" : 43},{"x" : 50,"y" : 30},{"x" : 40,"y" : 40},{"x" : 50,"y" : 34},{"x" : 51,"y" : 8}];
	officerPositions = [generateNewOfficer("Victor","Williamson","officer",0,17,1,500)];

//Class instances
var pathfinder = new Pathfinder();

/*officer position array is as follows:

	{
		"firstName" : "Isaac",
		"lastName" : "Ostler",
		"id" : GUID,
		"type" : "officer", //security, officer, intruder, other
		"positioning" :
		{
			"deck" : 0,
			"xPos" : 0,
			"yPos" : 0,
			"path" : [...], //pathfinding result
			"startTime" : x,
			"finishTime" : y
		} 
	}

*/

//type of world tiles 
/*
	{
		"state" : "open",
	}
*/

//init calls

initWorld(function(){
	drawCanvas();
});
drawCanvas()
startPathfindingTest();


//preset observers

//database observers

//functions

function drawOfficerPositions(deck){

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	if(!drawBounds){
		ctx.clearRect(0,0,width,height);
	}

	for(var i = 0;i < officerPositions.length;i++){
		if(officerPositions[i].positioning.deck == deck){
			ctx.beginPath();
			//this officer is on this deck, lets draw their position
			var xPos = officerPositions[i].positioning.xPos,
				yPos = officerPositions[i].positioning.yPos;
			ctx.moveTo(yPos * cellHeight + (cellHeight / 2),xPos * cellWidth + (cellWidth / 2),(cellWidth / cellWidth) * cellWidth * .25 + (cellWidth / 2));
			ctx.arc(yPos * cellHeight + (cellHeight / 2),xPos * cellWidth  + (cellWidth / 2),(cellWidth / cellWidth) * cellWidth * .25,0,2*Math.PI);
			ctx.fillStyle = officerPositions[i].type == "intruder" ? "red" : "white";
			ctx.fill();
		}
	}
	ctx.stroke();
}

function updateOfficerPosition(index){
	var totalTime = Math.max(officerPositions[index].positioning.finishTime - officerPositions[index].positioning.startTime,0);
	var timePassed = Date.now() - officerPositions[index].positioning.startTime;
	if(timePassed >= totalTime || officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0){
		//this person is already at the destination
		if(!(officerPositions[index].positioning.path == "NO PATH" || officerPositions[index].positioning.path.length == 0)){
			//if they had a path, set the x and y pos to the last step
			//officerPositions[index].positioning.xPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].x;
			//officerPositions[index].positioning.yPos = officerPositions[index].positioning.path[officerPositions[index].positioning.length - 1].y;
			var wanderPoint = safeWanderPoints[Math.floor(Math.random() * safeWanderPoints.length)];
			changeOfficerPath(index,wanderPoint.x,wanderPoint.y);
		}
		return;
	}
	var timePerStep = officerPositions[index].positioning.path.length / totalTime;
	var currentStep = Math.floor(timePassed / officerPositions[index].positioning.moveSpeed);
	var progress = 1 - ((currentStep + 1) - (timePassed / officerPositions[index].positioning.moveSpeed));

	var currentXStep = officerPositions[index].positioning.path[currentStep].x;
	var currentYStep = officerPositions[index].positioning.path[currentStep].y;

	if(currentStep > 0){
		var lastXStep = officerPositions[index].positioning.path[currentStep - 1].x
		var lastYStep = officerPositions[index].positioning.path[currentStep - 1].y
		var differenceX = currentXStep - lastXStep;
		var differenceY = currentYStep - lastYStep;
		officerPositions[index].positioning.xPos = lastXStep + (differenceX * progress);
		officerPositions[index].positioning.yPos = lastYStep + (differenceY * progress);
	}else{
		officerPositions[index].positioning.xPos = currentXStep;
		officerPositions[index].positioning.yPos = currentYStep;
	}
}

function generateNewOfficer(firstName,lastName,type,deck,positionX,positionY,moveSpeed){
	var newOfficer = 	
	{
		"firstName" : firstName,
		"lastName" : lastName,
		"id" : guidGenerator(),
		"type" : type, //security, officer, intruder, other
		"positioning" :
		{
			"deck" : 0,
			"moveSpeed" : moveSpeed,
			"xPos" : positionX,
			"yPos" : positionY,
			"path" : [], //pathfinding result
			"startTime" : null,
			"finishTime" : null
		},
		"state" :
		{
			"dead" : false,
			"frozen" : false,
			"injuried" : false
		}
	}
	return newOfficer;
}

function changeOfficerPath(index,newX,newY){

	officerPositions[index].positioning.path = pathfinder.getPathForPoints(worldMap,Math.floor(officerPositions[index].positioning.yPos),Math.floor(officerPositions[index].positioning.xPos),newX,newY);
	var totalTime = officerPositions[index].positioning.path.length * officerPositions[index].positioning.moveSpeed;
	officerPositions[index].positioning.startTime = Date.now();
	officerPositions[index].positioning.finishTime = Date.now() + totalTime;
}

function drawPath(path){
	if(path == null){
		return;
	}

	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();
	

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	if(drawBounds){
		drawCanvas();
	}

	ctx.beginPath();

	ctx.fillStyle = "rgba(255,0,0,.5)";

	for(var i = 0;i < path.length;i++){
		ctx.rect(path[i].y * cellHeight,path[i].x * cellWidth,cellHeight,cellWidth);
	}

	ctx.fill();
	ctx.stroke();
}

function startPathfindingTest(){
	canvas.off();
	canvas.on("mousedown",function(event){
		var width = canvas.width(),
			height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

		//drawPath(pathfinder.getPathForPoints(worldMap,1,17,x,y));
		console.log(x,y);
		changeOfficerPath(0,x,y);
		canvas.on("mousemove.draw",function(event){
			var width = canvas.width(),
				height = canvas.height(),

			cellWidth = width / gridWidth,
			cellHeight = height / gridHeight;
			x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
			y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

			changeOfficerPath(0,x,y);
			//drawPath(pathfinder.getPathForPoints(worldMap,1,17,x,y));
		});
		canvas.on("mouseup.end",function(event){
			canvas.off("mouseup.end");
			canvas.off("mousemove.draw");
		});
	});
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
   };
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function initWorld(callback){
	if(devDrawMode){
		worldMap = [];
		for(var i = 0;i < gridHeight;i++){
			worldMap[i] = [];
			for(var j = 0;j < gridWidth;j++){
				worldMap[i][j] = 
				{
					"state" : "open"
				}
			}
		}
		canvas.on("mousedown",function(event){
			var width = canvas.width(),
				height = canvas.height(),

				cellWidth = width / gridWidth,
				cellHeight = height / gridHeight;
				x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
				y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

			let drawState;
			if(worldMap[x][y].state == "closed"){
				drawState = "open";
				worldMap[x][y].state = "open";
			}else{
				drawState = "closed";
				worldMap[x][y].state = "closed";
			}
			callback();
			canvas.on("mousemove.draw",function(event){
				var width = canvas.width(),
					height = canvas.height(),

				cellWidth = width / gridWidth,
				cellHeight = height / gridHeight;
				x = Math.floor(Math.min(Math.max(event.offsetX / height,0),1) * gridWidth),
				y = Math.floor(Math.min(Math.max(event.offsetY / width,0),1) * gridHeight);

				worldMap[x][y].state = drawState;
				callback();
			});
			canvas.on("mouseup.end",function(event){
				canvas.off("mouseup.end");
				canvas.off("mousemove.draw");
			});
		});
		callback();
		return;
	}
	//worldMap = [];

	/*
	for(var i = 0;i < gridHeight;i++){
		worldMap[i] = [];
		for(var j = 0;j < gridWidth;j++){
			worldMap[i][j] = 
			{
				"state" : Math.random() > .25 ? "open" : "closed"
			}
		}
	}*/

	callback();
}

function setState(index,state,status){
	if(state == "frozen" || state == "dead"){
		if(status){
			//changeOfficerPath
		}else{

		}
	}else{

	}
}

function drawCanvas(){
	var ctx = canvas[0].getContext('2d');
	var width = canvas.width(),
		height = canvas.height();

	cellWidth = width / gridWidth,
	cellHeight = height / gridHeight;

	//clear the canvas
	ctx.clearRect(0,0,width,height);

	canvas.attr("width",width);
	canvas.attr("height",height);

	ctx.setLineDash([2,3]);
	ctx.strokeStyle = "rgb(95,95,95)";
	for(var i = 0;i < gridWidth;i++){
		ctx.moveTo(0,i * cellWidth);
		ctx.lineTo(width,i * cellWidth);
	}

	for(var i = 0;i < gridHeight;i++){
		ctx.moveTo(i * cellHeight,0);
		ctx.lineTo(i * cellHeight,height);
	}
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.beginPath();//draw world tiles
	for(var i = 0;i < worldMap.length;i++){
		for(var j = 0;j < worldMap[i].length;j++){
			if(worldMap[i][j].state == "closed"){
				ctx.rect(i * cellHeight,j * cellWidth,cellHeight,cellWidth);
			}
		}
	}
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.stroke();
}

//event handlers

//intervals
setInterval(function(){
	var type = Math.random() > .95 ? "intruder" : "officer";
	officerPositions.splice(officerPositions.length,0,generateNewOfficer("Officer", "#" + officerPositions.length,type,0,17,1,Math.random() * 550 + 1000));
	var wanderPoint = safeWanderPoints[Math.floor(Math.random() * safeWanderPoints.length)];
	changeOfficerPath(officerPositions.length - 1,wanderPoint.x,wanderPoint.y);
},750);

setInterval(function(){
	for(var i = 0;i < officerPositions.length;i++){
		updateOfficerPosition(i);
	}
	if(drawBounds){
		drawCanvas();
	}
	drawOfficerPositions(currentDeck);
},0050);