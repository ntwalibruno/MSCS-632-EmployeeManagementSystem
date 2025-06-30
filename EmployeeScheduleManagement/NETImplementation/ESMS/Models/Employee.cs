namespace Models
{
    public class Employee
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public List<Schedule> Schedule { get; set; } = new List<Schedule>();
        public Dictionary<DayOfWeek, List<ShiftPreference>> ShiftPreferences { get; set; } = new Dictionary<DayOfWeek, List<ShiftPreference>>();

        public int WorkDaysCount => Schedule.Count;

        public bool IsWorkingOn(DayOfWeek day)
        {
            return Schedule.Any(s => s.Day == day);
        }

        public bool IsAvailableToWork()
        {
            return WorkDaysCount < 5;
        }
    }

    public class ShiftPreference
    {
        public Shift Shift { get; set; }
        public int Priority { get; set; } // 1 is highest priority

        public ShiftPreference(Shift shift, int priority)
        {
            Shift = shift;
            Priority = priority;
        }
    }
}
