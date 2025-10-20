import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth.routes';
import { activityRouter } from './routes/activity.routes';
import { userRouter } from './routes/user.routes';
import { feedbackRouter } from './routes/feedback.routes';


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>();

app.use('/*', cors({
  origin: '*'
}))

app.route('/auth', authRouter)
app.route('/api/activity', activityRouter)
app.route('/api/users', userRouter);
app.route('/api/feedback', feedbackRouter);

app.get('/health', (c) => {
	return c.json({ message : "Server is running fine"})
	});

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html >
    <html lang="en" >
  <head>
  <meta charset="UTF-8" >
  <meta name="viewport" content = "width=device-width, initial-scale=1.0" >
  <title>Streaker API </title>
  <style>
        body { 
        font- family: Arial, sans - serif; 
        text - align: center; 
        padding: 50px; 
        background-color: #212121;
        color: MediumSeaGreen;
        }
        h1 { color: LightGray; }
        h2 { color: LightGray; }
        .intro {color:tomato}
        .last {color:orange}
</style>
</head>
    <body>
     <pre>
        <h1>Welcome to Streaker API! </h1>
         Here's a concise explanation of the streak tracking website:

          <p class="intro">Streak Tracker helps you build and maintain daily habits by tracking your consistency. Here's what it offers:

        <h2> Key Features: </h2>
        - Track daily activities with a simple "Mark Complete" button
        - Visual heatmap showing your activity history (similar to GitHub's contribution graph)
        - Current streak counter showing consecutive days of activity
        - Personal account to save your progress

        <h2>How it Works:</h2>
        1. Create an account or log in
        2. Each day you complete your activity, click "Mark Complete"
        3. The heatmap shows your activity patterns with darker colors for active days
        4. Watch your streak grow as you maintain daily consistency

        <h2>Perfect for:</h2>
        - Building new habits
        - Tracking daily learning/practice
        - Maintaining exercise routines
        - Monitoring productivity

        <p class="last">Think of it like a digital habit tracker that motivates you by visualizing your progress and 
        celebrating consistent effort through streak counting.</p>
        </pre>
    </body>
</html>
 `);
})

export default app
