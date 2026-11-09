#include <Servo.h>

Servo servo1;
Servo servo2;                         // tilting servo

const int rainSensor = 2;
const int servoPin = 9;
const int servo2Pin = 10;             // pin for Servo 2

const unsigned long waitTime = 30000;     // 30 seconds under the shed
const unsigned long tiltTime = 3000;      // 3 seconds tilted
unsigned long rainStartTime = 0;
bool timerRunning = false;
bool clothesOffloaded = false;

void setup() {
  pinMode(rainSensor, INPUT);

  servo1.attach(servoPin);
  servo2.attach(servo2Pin);

  // Initial position: clothesline outside
  servo1.write(0);
  servo2.write(90);                   // UPDATED: Servo 2 at 90 when Servo 1 is at 0

  Serial.begin(9600);
}

void loop() {
  int rainStatus = digitalRead(rainSensor);

  Serial.println(rainStatus);

  if (rainStatus == LOW) {
    // Rain detected: move clothesline under the shed
    servo1.write(70);
    servo2.write(90);                  // UPDATED: Servo 2 at 90 when Servo 1 is at 70

    // start the 30 second timer once, when rain is first detected
    if (!timerRunning) {
      rainStartTime = millis();
      timerRunning = true;
    }

    // after 30 seconds, tilt once to offload the clothes
    if (!clothesOffloaded && (millis() - rainStartTime >= waitTime)) {
      servo2.write(0);               // tilt to release clothes
      delay(tiltTime);                // hold for 3 seconds
      servo2.write(90);                // return to normal (under shed position)
      clothesOffloaded = true;        // do not tilt again while rain continues
    }
  } 
  else {
    // No rain: move clothesline outside
    servo1.write(0);
    servo2.write(90);                 // UPDATED: Servo 2 at 90 when Servo 1 is at 0

    // reset everything for the next rain event
    timerRunning = false;
    clothesOffloaded = false;
  }

  delay(500);
}