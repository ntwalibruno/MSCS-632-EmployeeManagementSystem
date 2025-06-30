namespace Models
{
    public enum Shift
    {
        Morning,
        Afternoon,
        Night
    }

    public enum DayOfWeek
    {
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
        Sunday
    }

    public class Schedule
    {
        public Guid ScheduleId { get; set; } = Guid.NewGuid();
        public DayOfWeek Day { get; set; }
        public Shift Shift { get; set; }

        public Schedule() { }

        public Schedule(DayOfWeek day, Shift shift)
        {
            Day = day;
            Shift = shift;
        }

        public string PrintSchedule()
        {
            return $"Day: {Day}, Shift: {Shift}";
        }
    }
}
