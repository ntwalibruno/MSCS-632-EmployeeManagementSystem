// Employee Schedule Management System
class ScheduleManager {
    constructor() {
        this.employees = [];
        this.schedule = {};
        this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        this.shifts = ['morning', 'afternoon', 'evening'];
        this.init();
    }

    init() {
        this.loadEmployeesFromStorage();
        this.setupEventListeners();
        this.switchTab('employees');
        this.renderEmployees();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.nav-btn').dataset.tab;
                this.switchTab(tab);
            });
        });

        // Employee form
        document.getElementById('employee-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEmployee();
        });

        // Load test data
        document.getElementById('load-test-data').addEventListener('click', () => {
            this.loadTestData();
        });

        // Generate schedule
        document.getElementById('generate-schedule').addEventListener('click', () => {
            this.generateSchedule();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('employee-modal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('employee-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected tab and button
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    addEmployee() {
        const name = document.getElementById('employee-name').value.trim();
        if (!name) {
            this.showMessage('Please enter an employee name', 'error');
            return;
        }

        // Check if employee already exists
        if (this.employees.some(emp => emp.name.toLowerCase() === name.toLowerCase())) {
            this.showMessage('Employee already exists', 'error');
            return;
        }

        const preferences = this.collectPreferences();
        const employee = {
            id: Date.now(),
            name: name,
            preferences: preferences
        };

        this.employees.push(employee);
        this.saveEmployeesToStorage();
        this.renderEmployees();
        this.clearForm();
        this.showMessage(`Employee ${name} added successfully!`, 'success');
    }

    collectPreferences() {
        const preferences = {};
        
        this.days.forEach(day => {
            preferences[day] = {};
            this.shifts.forEach(shift => {
                const select = document.querySelector(`select[name="${day}-${shift}"]`);
                const value = select.value;
                if (value) {
                    preferences[day][shift] = parseInt(value);
                }
            });
        });

        return preferences;
    }

    clearForm() {
        document.getElementById('employee-form').reset();
    }

    renderEmployees() {
        const container = document.getElementById('employees-container');
        
        if (this.employees.length === 0) {
            container.innerHTML = `
                <div class="employee-placeholder">
                    <i class="fas fa-users"></i>
                    <p>No employees added yet. Add your first employee above!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.employees.map(employee => `
            <div class="employee-card fade-in">
                <div class="employee-header">
                    <div class="employee-name">${employee.name}</div>
                    <div class="employee-actions">
                        <button class="btn btn-small btn-secondary" onclick="scheduleManager.viewEmployee(${employee.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-small btn-danger" onclick="scheduleManager.deleteEmployee(${employee.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="employee-preferences">
                    ${this.renderEmployeePreferences(employee.preferences)}
                </div>
            </div>
        `).join('');
    }

    renderEmployeePreferences(preferences) {
        return this.days.map(day => {
            const dayPrefs = preferences[day] || {};
            const sortedPrefs = Object.entries(dayPrefs)
                .sort(([,a], [,b]) => a - b)
                .map(([shift, priority]) => `${shift}(${priority})`)
                .join(', ');
            
            return `
                <div class="day-prefs">
                    <strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong>
                    <div class="pref-item">${sortedPrefs || 'No preferences'}</div>
                </div>
            `;
        }).join('');
    }

    viewEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        const modal = document.getElementById('employee-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = `${employee.name} - Shift Preferences`;
        body.innerHTML = `
            <div class="modal-preferences">
                ${this.days.map(day => {
                    const dayPrefs = employee.preferences[day] || {};
                    return `
                        <div class="modal-day-section">
                            <h4>${day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                            <div class="modal-shifts">
                                ${this.shifts.map(shift => {
                                    const priority = dayPrefs[shift];
                                    return `
                                        <div class="modal-shift ${priority ? 'has-preference' : ''}">
                                            <span class="shift-name">${shift.charAt(0).toUpperCase() + shift.slice(1)}</span>
                                            <span class="shift-priority">${priority ? `Priority ${priority}` : 'Not preferred'}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        modal.style.display = 'block';
    }

    deleteEmployee(employeeId) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employees = this.employees.filter(emp => emp.id !== employeeId);
            this.saveEmployeesToStorage();
            this.renderEmployees();
            this.showMessage('Employee deleted successfully', 'success');
        }
    }

    generateSchedule() {
        if (this.employees.length < 6) {
            this.showMessage('You need at least 6 employees to generate a proper schedule (minimum 2 per shift)', 'error');
            return;
        }

        this.schedule = this.createOptimalSchedule();
        this.renderSchedule();
        this.renderAnalytics();
        this.showMessage('Schedule generated successfully!', 'success');
    }

    createOptimalSchedule() {
        const schedule = {};
        const employeeWorkDays = {};
        
        // Initialize schedule structure and employee work tracking
        this.days.forEach(day => {
            schedule[day] = {
                morning: [],
                afternoon: [],
                evening: []
            };
        });

        this.employees.forEach(emp => {
            employeeWorkDays[emp.id] = 0;
        });

        // First pass: Assign based on preferences
        this.days.forEach(day => {
            this.shifts.forEach(shift => {
                const availableEmployees = this.getAvailableEmployeesForShift(day, shift, employeeWorkDays);
                const sorted = this.sortByPreference(availableEmployees, day, shift);
                
                // Assign first 2 employees if available
                for (let i = 0; i < Math.min(2, sorted.length); i++) {
                    const employee = sorted[i];
                    schedule[day][shift].push(employee);
                    employeeWorkDays[employee.id]++;
                }
            });
        });

        // Second pass: Fill understaffed shifts
        this.days.forEach(day => {
            this.shifts.forEach(shift => {
                while (schedule[day][shift].length < 2) {
                    const availableEmployees = this.getAvailableEmployeesForShift(day, shift, employeeWorkDays);
                    const unassignedToday = availableEmployees.filter(emp => 
                        !this.isEmployeeAssignedToday(emp, day, schedule)
                    );

                    if (unassignedToday.length > 0) {
                        // Prefer employees with fewer work days
                        const sorted = unassignedToday.sort((a, b) => 
                            employeeWorkDays[a.id] - employeeWorkDays[b.id]
                        );
                        const employee = sorted[0];
                        schedule[day][shift].push(employee);
                        employeeWorkDays[employee.id]++;
                    } else {
                        // If no one is available, we'll leave it understaffed
                        break;
                    }
                }
            });
        });

        return schedule;
    }

    getAvailableEmployeesForShift(day, shift, employeeWorkDays) {
        return this.employees.filter(emp => 
            employeeWorkDays[emp.id] < 5 // Max 5 days per week
        );
    }

    sortByPreference(employees, day, shift) {
        return employees.sort((a, b) => {
            const aPreference = (a.preferences[day] && a.preferences[day][shift]) || 999;
            const bPreference = (b.preferences[day] && b.preferences[day][shift]) || 999;
            return aPreference - bPreference;
        });
    }

    isEmployeeAssignedToday(employee, day, schedule) {
        return this.shifts.some(shift => 
            schedule[day][shift].some(emp => emp.id === employee.id)
        );
    }

    renderSchedule() {
        const container = document.getElementById('schedule-container');
        
        container.innerHTML = `
            <div class="schedule-table">
                <table>
                    <thead>
                        <tr>
                            <th>Time / Day</th>
                            ${this.days.map(day => `<th>${day.charAt(0).toUpperCase() + day.slice(1)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.shifts.map(shift => `
                            <tr>
                                <td class="shift-header">${shift.charAt(0).toUpperCase() + shift.slice(1)}<br><small>${this.getShiftTime(shift)}</small></td>
                                ${this.days.map(day => `
                                    <td class="shift-cell ${shift}-shift">
                                        ${this.schedule[day][shift].map(employee => `
                                            <div class="employee-tag">${employee.name}</div>
                                        `).join('')}
                                        ${this.schedule[day][shift].length < 2 ? 
                                            `<div class="employee-tag" style="background: #dc3545;">UNDERSTAFFED</div>` : ''
                                        }
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getShiftTime(shift) {
        const times = {
            morning: '6:00 AM - 2:00 PM',
            afternoon: '2:00 PM - 10:00 PM',
            evening: '10:00 PM - 6:00 AM'
        };
        return times[shift];
    }

    loadTestData() {
        if (this.employees.length > 0) {
            if (!confirm('This will replace all current employees. Continue?')) {
                return;
            }
        }

        const testEmployees = [
            {
                id: 1,
                name: "Alice Johnson",
                preferences: {
                    monday: { morning: 1, afternoon: 2 },
                    tuesday: { morning: 1 },
                    wednesday: { afternoon: 1, evening: 2 },
                    thursday: { morning: 2, afternoon: 1 },
                    friday: { afternoon: 1 },
                    saturday: { evening: 1 },
                    sunday: { morning: 1 }
                }
            },
            {
                id: 2,
                name: "Bob Smith",
                preferences: {
                    monday: { afternoon: 1, evening: 2 },
                    tuesday: { evening: 1 },
                    wednesday: { morning: 2, afternoon: 1 },
                    thursday: { evening: 1 },
                    friday: { morning: 1, afternoon: 2 },
                    saturday: { morning: 1 },
                    sunday: { afternoon: 1 }
                }
            },
            {
                id: 3,
                name: "Carol Davis",
                preferences: {
                    monday: { evening: 1 },
                    tuesday: { morning: 1, afternoon: 2 },
                    wednesday: { evening: 1 },
                    thursday: { morning: 1 },
                    friday: { evening: 1 },
                    saturday: { afternoon: 1, evening: 2 },
                    sunday: { evening: 1 }
                }
            },
            {
                id: 4,
                name: "David Wilson",
                preferences: {
                    monday: { morning: 2, afternoon: 1 },
                    tuesday: { afternoon: 1, evening: 2 },
                    wednesday: { morning: 1 },
                    thursday: { afternoon: 2, evening: 1 },
                    friday: { morning: 1 },
                    saturday: { morning: 2, afternoon: 1 },
                    sunday: { afternoon: 2, evening: 1 }
                }
            },
            {
                id: 5,
                name: "Emma Brown",
                preferences: {
                    monday: { morning: 1 },
                    tuesday: { morning: 2, afternoon: 1 },
                    wednesday: { morning: 1, afternoon: 2 },
                    thursday: { morning: 1 },
                    friday: { afternoon: 1, evening: 2 },
                    saturday: { evening: 1 },
                    sunday: { morning: 2, afternoon: 1 }
                }
            },
            {
                id: 6,
                name: "Frank Miller",
                preferences: {
                    monday: { evening: 1 },
                    tuesday: { evening: 1 },
                    wednesday: { afternoon: 2, evening: 1 },
                    thursday: { evening: 1 },
                    friday: { evening: 1 },
                    saturday: { morning: 1, evening: 2 },
                    sunday: { evening: 1 }
                }
            },
            {
                id: 7,
                name: "Grace Lee",
                preferences: {
                    monday: { afternoon: 1, evening: 2 },
                    tuesday: { morning: 1, afternoon: 2 },
                    wednesday: { afternoon: 1 },
                    thursday: { morning: 2, afternoon: 1 },
                    friday: { morning: 1 },
                    saturday: { afternoon: 1 },
                    sunday: { morning: 1, afternoon: 2 }
                }
            },
            {
                id: 8,
                name: "Henry Taylor",
                preferences: {
                    monday: { morning: 1, evening: 2 },
                    tuesday: { morning: 1 },
                    wednesday: { morning: 2, evening: 1 },
                    thursday: { morning: 1 },
                    friday: { morning: 2, evening: 1 },
                    saturday: { morning: 1 },
                    sunday: { evening: 1 }
                }
            }
        ];

        this.employees = testEmployees;
        this.saveEmployeesToStorage();
        this.renderEmployees();
        this.showMessage('Test data loaded successfully! 8 employees added with varied preferences.', 'success');
    }

    saveEmployeesToStorage() {
        try {
            localStorage.setItem('employeeScheduleData', JSON.stringify(this.employees));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadEmployeesFromStorage() {
        try {
            const saved = localStorage.getItem('employeeScheduleData');
            if (saved) {
                this.employees = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
            this.employees = [];
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.main-content');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the application
const scheduleManager = new ScheduleManager();

// Add some additional utility functions for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add tooltips for better user experience
    const style = document.createElement('style');
    style.textContent = `
        .tooltip {
            position: relative;
            cursor: help;
        }
        
        .tooltip::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
            z-index: 1000;
        }
        
        .tooltip:hover::after {
            opacity: 1;
        }
        
        .modal-preferences {
            max-height: 500px;
            overflow-y: auto;
        }
        
        .modal-day-section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        
        .modal-day-section h4 {
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 5px;
        }
        
        .modal-shifts {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        
        .modal-shift {
            padding: 10px;
            border-radius: 6px;
            background: #f8f9fa;
            text-align: center;
            border: 2px solid transparent;
        }
        
        .modal-shift.has-preference {
            background: #e3f2fd;
            border-color: #2196f3;
        }
        
        .shift-name {
            display: block;
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
        }
        
        .shift-priority {
            font-size: 0.9em;
            color: #6c757d;
        }
        
        .has-preference .shift-priority {
            color: #1976d2;
            font-weight: 600;
        }
        
        .employee-placeholder {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
        }
        
        .employee-placeholder i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .employee-placeholder p {
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
});

// Export for potential future use or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleManager;
}
