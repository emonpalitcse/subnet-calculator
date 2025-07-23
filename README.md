# Multi-Subnet Calculator

A web-based subnet calculator that supports multiple subnets with variable host requirements.  
Supports both **VLSM (Variable Length Subnet Masking)** and **Fixed Length Subnet Masking** allocation modes.  

## Features

- Input base network in CIDR notation (e.g., 192.168.0.0/20)  
- Input host counts for multiple subnets (comma-separated)  
- Choose allocation mode: VLSM or Fixed length  
- Calculates subnet mask, network address, broadcast address, usable IP range  
- Light and Dark theme toggle  
- Responsive and works on desktop and mobile browsers  

## How to Use

1. Enter the base network in CIDR format.  
2. Enter host counts separated by commas (e.g., 80,50,30,2,2,2).  
3. Select allocation mode (VLSM or Fixed Length).  
4. Click **Calculate** to see the subnet allocation results.

## Technologies Used

- HTML  
- CSS  
- JavaScript  

## How to Run Locally

1. Clone or download the repository.  
2. Open `index.html` in any modern browser.  
3. Use the form to calculate subnets.

## License

MIT License

---

Made with ❤️ by Emon Palit
