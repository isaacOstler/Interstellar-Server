# Please Note
This project is depreciated.  See Interstellar-2.0 instead.

# Interstellar Server
Multiplatform, agile, stable, and flexible simulation framework.

# Running Interstellar
Here is what you need to know to get yourself up and running.<br />
1) npm install
2) npm install electron -g<br />
<b>After that</b><br />
'electron index.js --buildCards' (optional, port number)<br />
<i><b>Example:</b> electron index.js --buildCards 3000</i><Br />This will start the server on port 3000<br /><Br />
<b>What is this '--buildCards' flag?</b> This flag tells interstellar it needs to compress all the cards in the cards folder before starting.  This needs to be run every time an edit has been made to a card.  Not passing this flag will used the previously compiled cards, and the server will start up much faster.
