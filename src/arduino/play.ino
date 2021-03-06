#define BUZZER_PIN 13
#define GROUND_PIN 9
#define SEPARATOR ','
#define END_OF_NOTE ';'

void setup()
{
    Serial.begin(9600);
    pinMode(BUZZER_PIN, OUTPUT);
    // Required for circle_v2 only
    pinMode(GROUND_PIN, OUTPUT);
}

void loop()
{
    // Required for circle_v2 only
    digitalWrite(GROUND_PIN, LOW);

    if (Serial.available() > 0)
    {
        playNote();
    }
}

void playNote()
{
    String message = Serial.readStringUntil(END_OF_NOTE);

    int delimiterIdx = message.indexOf(SEPARATOR);
    String frequencyStr = message.substring(0, delimiterIdx);
    String durationStr = message.substring(delimiterIdx + 1, message.length());

    long frequency = frequencyStr.toInt();
    float duration = durationStr.toFloat();

    // Handle pause
    if (frequency == -1)
    {
        delay(duration);
        return;
    }

    tone(BUZZER_PIN, frequency, duration);
    delay(duration);
}