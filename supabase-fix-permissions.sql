-- Enable Row Level Security on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Grant permissions to the anon role (public users)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO anon;

-- Create policy to allow everyone to read all appointments
CREATE POLICY "Anyone can view appointments"
ON appointments FOR SELECT
USING (true);

-- Create policy to allow everyone to insert appointments
CREATE POLICY "Anyone can create appointments"
ON appointments FOR INSERT
WITH CHECK (true);

-- Create policy to allow everyone to update appointments
CREATE POLICY "Anyone can update appointments"
ON appointments FOR UPDATE
USING (true);

-- Create policy to allow everyone to delete appointments
CREATE POLICY "Anyone can delete appointments"
ON appointments FOR DELETE
USING (true);
