Elias Penkkimäki
This is a demo application for a listener training software for my friends:
JAVA backend (spring boot, Maven) and SQL
Frontend with LIT
built with VS code and GIT

In order to run this you need to have installed following programs:
Docker,
Maven,
Java and JAVA SDK to create the JAR file in the (mvn clean package -phase)
(npm / node.js)

After you have downloaded and extracted the files into your prefered folder you can add the audio files
At this state in order to see any sound files you need to manually add them in the audio folder that can be located in:
LIT/back/src/main/audio
just paste the .mp3 files there. After this step:

open CMD.
here go for example you extracted the files to your desktop folder so you write:
cd /desktop/LIT
cd back
mvn clean package
docker-compose up --build

this will launch the application and after everything is installed (could be long time for first install)
You can open a browser and go to the following web adress (this does not require internet connection to work): http://localhost:5173/

Note the part below might be fixed in the latest push if I remmeber correctly:
In order to see new audio files (if added during running the application) you need to relaunch the app by
opening the CMD where the program runs in and pressing Ctrl+C.
After this just "docker-compose up" and re launch the app.
Now if you have the browser open while re-launching the app you need to refresh the browser (press F5) to make the audio files visible once the backend has launched.

