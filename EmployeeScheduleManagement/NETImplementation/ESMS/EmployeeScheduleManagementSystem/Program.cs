using Models;
using System.Text.Json;
using DayOfWeek = Models.DayOfWeek;

const string dataFile = "employees.json";

// Helper to load employees from JSON
List<Employee> LoadEmployees()
{
    if (!File.Exists(dataFile))
    {
        // Seed with 5 initial employees and schedules
        var initialEmployees = new List<Employee>
        {
            new Employee
            {
                FirstName = "Alice",
                LastName = "Smith",
                Schedule = new List<Schedule>
                {
                    new Schedule(DayOfWeek.Monday, Shift.Morning),
                    new Schedule(DayOfWeek.Tuesday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Wednesday, Shift.Night),
                    new Schedule(DayOfWeek.Thursday, Shift.Morning),
                    new Schedule(DayOfWeek.Friday, Shift.Afternoon)
                }
            },
            new Employee
            {
                FirstName = "Bob",
                LastName = "Johnson",
                Schedule = new List<Schedule>
                {
                    new Schedule(DayOfWeek.Monday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Tuesday, Shift.Morning),
                    new Schedule(DayOfWeek.Wednesday, Shift.Morning),
                    new Schedule(DayOfWeek.Thursday, Shift.Night),
                    new Schedule(DayOfWeek.Friday, Shift.Night)
                }
            },
            new Employee
            {
                FirstName = "Carol",
                LastName = "Williams",
                Schedule = new List<Schedule>
                {
                    new Schedule(DayOfWeek.Monday, Shift.Night),
                    new Schedule(DayOfWeek.Tuesday, Shift.Night),
                    new Schedule(DayOfWeek.Wednesday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Thursday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Friday, Shift.Morning)
                }
            },
            new Employee
            {
                FirstName = "David",
                LastName = "Brown",
                Schedule = new List<Schedule>
                {
                    new Schedule(DayOfWeek.Monday, Shift.Morning),
                    new Schedule(DayOfWeek.Tuesday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Wednesday, Shift.Night),
                    new Schedule(DayOfWeek.Thursday, Shift.Morning),
                    new Schedule(DayOfWeek.Friday, Shift.Afternoon)
                }
            },
            new Employee
            {
                FirstName = "Eve",
                LastName = "Davis",
                Schedule = new List<Schedule>
                {
                    new Schedule(DayOfWeek.Monday, Shift.Afternoon),
                    new Schedule(DayOfWeek.Tuesday, Shift.Morning),
                    new Schedule(DayOfWeek.Wednesday, Shift.Morning),
                    new Schedule(DayOfWeek.Thursday, Shift.Night),
                    new Schedule(DayOfWeek.Friday, Shift.Night)
                }
            }
        };
        File.WriteAllText(dataFile, JsonSerializer.Serialize(initialEmployees, new JsonSerializerOptions { WriteIndented = true }));
        return initialEmployees;
    }
    var json = File.ReadAllText(dataFile);
    return JsonSerializer.Deserialize<List<Employee>>(json) ?? new List<Employee>();
}

// Helper to save employees to JSON
void SaveEmployees(List<Employee> employees)
{
    File.WriteAllText(dataFile, JsonSerializer.Serialize(employees, new JsonSerializerOptions { WriteIndented = true }));
}

// Print all employees' schedules
void PrintAllSchedules(List<Employee> employees)
{
    Console.WriteLine("\n===== EMPLOYEE SCHEDULES =====\n");
    foreach (var employee in employees)
    {
        Console.WriteLine($"{employee.FirstName} {employee.LastName}'s Schedule:");
        if (employee.Schedule != null && employee.Schedule.Any())
        {
            foreach (var schedule in employee.Schedule)
            {
                Console.WriteLine($"- {schedule.PrintSchedule()}");
            }
        }
        else
        {
            Console.WriteLine("- No shifts assigned");
        }
        Console.WriteLine();
    }
}

Console.WriteLine("Welcome to the Employee Schedule Management System!");
Console.WriteLine("This system allows you to manage employee schedules efficiently.");

var employees = LoadEmployees();

Console.WriteLine("Choose an option:");
Console.WriteLine("1. Print current schedule");
Console.WriteLine("2. Add employee and generate new schedule");
Console.Write("Enter your choice (1 or 2): ");
var choice = Console.ReadLine();

if (choice == "1")
{
    PrintAllSchedules(employees);
    Console.WriteLine("Press any key to exit...");
    Console.ReadKey();
    return;
}

// Add new employee
Console.WriteLine("\nAdding a new employee...");
Console.Write("Enter first name: ");
string firstName = Console.ReadLine();

Console.Write("Enter last name: ");
string lastName = Console.ReadLine();

var newEmployee = new Employee
{
    FirstName = firstName,
    LastName = lastName
};

// Collect shift preferences for each day
Console.WriteLine("\nEnter shift preferences for each day (1=highest priority, 3=lowest)");

foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
{
    Console.WriteLine($"\n{day} preferences:");
    newEmployee.ShiftPreferences[day] = new List<ShiftPreference>();

    Console.Write("Morning shift priority (1-3): ");
    int morningPriority = int.Parse(Console.ReadLine());

    Console.Write("Afternoon shift priority (1-3): ");
    int afternoonPriority = int.Parse(Console.ReadLine());

    Console.Write("Night shift priority (1-3): ");
    int nightPriority = int.Parse(Console.ReadLine());

    newEmployee.ShiftPreferences[day].Add(new ShiftPreference(Shift.Morning, morningPriority));
    newEmployee.ShiftPreferences[day].Add(new ShiftPreference(Shift.Afternoon, afternoonPriority));
    newEmployee.ShiftPreferences[day].Add(new ShiftPreference(Shift.Night, nightPriority));
}

employees.Add(newEmployee);

// Generate schedule for all employees
var scheduleManager = new ScheduleManager(employees);
scheduleManager.GenerateSchedule();

// Save updated employees with schedules
SaveEmployees(employees);

// Display the weekly schedule
scheduleManager.PrintWeeklySchedule();

// Display individual employee schedules
PrintAllSchedules(employees);

Console.WriteLine("Press any key to exit...");
Console.ReadKey();
