# Employee Schedule Management System

A web-based application for managing employee shifts and preferences using HTML, CSS, and JavaScript.

## Features

### Core Functionality
- **Employee Management**: Add, view, and delete employees with detailed shift preferences
- **Priority-Based Scheduling**: Employees can rank their shift preferences (1st, 2nd, 3rd choice)
- **Intelligent Scheduling Algorithm**: Automatically generates optimal schedules considering:
  - No employee works more than one shift per day
  - Maximum of 5 working days per week per employee
  - Minimum of 2 employees per shift for proper coverage
  - Conflict resolution with alternative shift assignments

### User Interface
- **Tabbed Navigation**: for switching between Employee Management, and Schedule View

### Data Management
- **Local Storage**: saving and loading of employee data in a json file
- **Test Data**: Pre-loaded sample data for testing and demonstration
## File Structure

```
JSImplementation/
├── index.html          # Main HTML structure and UI components
├── styles.css          # Modern CSS styling with responsive design
├── script.js           # Core JavaScript logic and scheduling algorithms
├── testData.json       # Sample employee data for testing
└── README.md          # This documentation file
```

## Getting Started


### Installation
1. Download or clone all files to a local directory
2. Open `index.html` in your web browser

### Quick Start
1. **Load Test Data**: Click "Load Test Data" to populate the system with 10 sample employees
2. **Generate Schedule**: Navigate to the "Schedule" tab and click "Generate Schedule"

## Usage Guide

### Adding Employees
1. Go to the "Employees" tab
2. Enter the employee name
3. Set shift preferences by selecting priority rankings (1-3) for desired shifts
4. Click "Add Employee"

### Viewing Employee Details
- Click "View" on any employee card to see detailed preferences
- Click "Delete" to remove an employee (with confirmation)

## Data Format

Employee data is stored in JSON format:

```json
{
  "id": 1,
  "name": "Employee Name",
  "preferences": {
    "monday": {
      "morning": 1,    // 1st preference
      "afternoon": 2   // 2nd preference
    },
    "tuesday": {
      "evening": 1     // 1st preference
    }
    // ... other days
  }
}
```

## Business Rules

### Employee Constraints
- Maximum 1 shift per day
- Maximum 5 working days per week
- Preferences ranked 1-3 (1 = highest priority)

