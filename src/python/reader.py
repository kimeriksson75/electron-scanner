# import sys
# import time

# def main():
    
#     try:
#         time.sleep(3)
#         print('test-tag')
#     except Exception as e:
#         exit_program()

# def exit_program():
#     print("Exiting program...")
#     sys.exit(0)
    
# if __name__ == "__main__":
#     main()
    
import sys
sys.path.append('/home/kimeriksson/MFRC522-python')
import time
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

rfid = SimpleMFRC522()

def main():
    
    try:
        id, text = rfid.read()
        print(id)
    finally:
        exit_program()
def exit_program():
    GPIO.cleanup()
    sys.exit(0)
    
if __name__ == "__main__":
    main()
