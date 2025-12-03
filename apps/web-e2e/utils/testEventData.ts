/**
 * Rich test data for creating realistic events with proper markdown content.
 * This helps test markdown rendering, formatting, and layout on public pages.
 */

import { EventFormDto } from '@eventuras/event-sdk';

export type TestEventData = EventFormDto;

/**
 * Generate a random, fun event title by combining adjectives, descriptors, and event types.
 *
 * Examples:
 * - "Spectacular International Tech Conference"
 * - "Innovative Nordic Leadership Summit"
 * - "Epic Summer Coding Workshop"
 */
const generateEventTitle = (): string => {
  const adjectives = [
    'Amazing', 'Spectacular', 'Epic', 'Fantastic', 'Incredible', 'Awesome',
    'Outstanding', 'Exceptional', 'Remarkable', 'Extraordinary', 'Brilliant',
    'Magnificent', 'Phenomenal', 'Marvelous', 'Wonderful', 'Supreme'
  ];

  const descriptors = [
    'International', 'Nordic', 'European', 'Global', 'Annual', 'Spring',
    'Summer', 'Autumn', 'Winter', 'Digital', 'Virtual', 'Live', 'Hybrid',
    'Professional', 'Advanced', 'Expert', 'Master', 'Elite', 'Premium'
  ];

  const eventTypes = [
    'Conference', 'Summit', 'Workshop', 'Seminar', 'Symposium', 'Convention',
    'Forum', 'Meetup', 'Bootcamp', 'Training', 'Course', 'Hackathon',
    'Retreat', 'Gathering', 'Festival', 'Expo', 'Showcase', 'Dinner',
    'Gala', 'Celebration', 'Ceremony'
  ];

  const themes = [
    'Tech', 'Innovation', 'Leadership', 'Business', 'Coding', 'Design',
    'Marketing', 'Sales', 'AI', 'Cloud', 'DevOps', 'Agile', 'Startup',
    'Entrepreneurship', 'Strategy', 'Development', 'Architecture', 'Data'
  ];

  // Pick random items
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  // Randomly choose between different title patterns
  const patterns = [
    `${adjective} ${descriptor} ${theme} ${eventType}`,
    `${adjective} ${theme} ${eventType}`,
    `${descriptor} ${theme} ${eventType}`,
    `${adjective} ${descriptor} ${eventType}`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)]!;
};

/**
 * Generate a random city and venue combination.
 */
const generateLocation = (): { city: string; venue: string } => {
  const cities = [
    'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø', 'Kristiansand',
    'Stockholm', 'Copenhagen', 'Helsinki', 'Reykjavik', 'Amsterdam',
    'Berlin', 'Munich', 'Vienna', 'Zurich', 'London', 'Dublin', 'Paris',
    'Barcelona', 'Lisbon', 'Prague', 'Warsaw', 'Tallinn', 'Riga'
  ];

  const venues = [
    'Convention Center', 'Conference Hall', 'Business Hub', 'Innovation Campus',
    'Tech Park', 'Grand Hotel', 'University Auditorium', 'Cultural Center',
    'Exhibition Center', 'Digital Arena', 'Science Museum', 'City Hall',
    'Waterfront Center', 'Sky Tower', 'Harbor House', 'Central Plaza'
  ];

  const city = cities[Math.floor(Math.random() * cities.length)]!;
  const venue = venues[Math.floor(Math.random() * venues.length)]!;

  return { city, venue: `${city} ${venue}` };
};

/**
 * Generate rich test event data with comprehensive markdown content.
 *
 * This creates realistic event data suitable for testing markdown rendering,
 * including headings, lists, formatting, and emojis.
 */
export const generateTestEventData = (baseName: string): TestEventData => {
  const eventTitle = `${generateEventTitle()} - ${baseName}`;
  const location = generateLocation();

  return {
    title: eventTitle,
    headline: `${eventTitle} - A comprehensive learning experience`,
    category: 'Technology & Innovation',
    description: `Join us for **${eventTitle}**, an exciting event that brings together professionals and enthusiasts from around the world.

This event will cover the latest trends and best practices, with hands-on workshops and networking opportunities.`,

    program: `### Day 1 - Introduction & Fundamentals

#### Morning Session (09:00 - 12:00)
- **09:00 - 09:30**: Registration and Welcome Coffee
- **09:30 - 10:00**: Opening Keynote by Industry Leader
- **10:00 - 11:30**: Workshop: Getting Started
  - Hands-on exercises
  - Group discussions
  - Q&A session
- **11:30 - 12:00**: Coffee Break & Networking

#### Afternoon Session (13:00 - 17:00)
1. **Advanced Techniques** (13:00 - 14:30)
   - Live demonstrations
   - Best practices
   - Case studies
2. **Panel Discussion** (14:45 - 16:00)
   - Industry experts
   - Interactive Q&A
3. **Closing Remarks** (16:00 - 17:00)

---

### Day 2 - Advanced Topics & Certification

#### Full Day Workshop (09:00 - 16:00)
- Deep dive sessions
- Practical implementations
- Group projects
- **Certificate ceremony** at 16:00

> "This event changed how I approach my work!" - Previous Participant`,

    practicalInformation: `### Getting There

#### By Public Transport
- **Train**: Main Station is 10 minutes walk from venue
- **Bus**: Lines 15, 22, and 34 stop at "Conference Center"
- **Metro**: Red line to "Central Square" station

#### By Car
- Parking available on-site (€15/day)
- Address: ${eventTitle} location, ${eventTitle} city
- GPS coordinates provided after registration

---

### What to Bring

**Required:**
- Valid ID for registration
- Laptop with charger
- Notepad and pen

**Recommended:**
- Water bottle (refill stations available)
- Business cards for networking
- Comfortable shoes

---

### Accommodation

#### Nearby Hotels
1. **Grand Hotel Conference** - 5 min walk (€120/night)
2. **Budget Stay Express** - 10 min bus (€60/night)
3. **City Center Apartments** - 15 min walk (€80/night)

*Special rates available - mention "${eventTitle}" when booking*

### Food & Beverages

- ☕ Coffee and refreshments provided
- 🍽️ Lunch included both days
- 🥐 Morning pastries available
- 🌱 Vegetarian/vegan options available
- ⚠️ Please inform us of allergies during registration`,

    moreInformation: `### About This Event

${eventTitle} is designed for professionals and enthusiasts who want to stay at the forefront of their field.

#### Learning Objectives

By the end of this event, participants will be able to:

- ✅ Understand core concepts and principles
- ✅ Apply best practices in real-world scenarios
- ✅ Collaborate effectively with peers
- ✅ Implement advanced techniques
- ✅ Earn a professional certificate

#### Target Audience

This event is perfect for:
- Beginners looking to get started
- Intermediate practitioners wanting to level up
- Advanced users seeking latest trends
- Team leaders planning implementations

---

### Speakers & Instructors

Our team includes industry veterans, published authors, and practitioners with years of experience.

#### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please review our [Code of Conduct](https://example.com) before attending.

---

### Contact & Support

**Questions?** Contact us at:
- 📧 Email: info@${eventTitle.toLowerCase().replaceAll(/\s+/g, '')}.com
- 📞 Phone: +1 (555) 123-4567
- 💬 Live chat: Available on our website

**Follow us:**
- Twitter: @${eventTitle.toLowerCase().replaceAll(/\s+/g, '')}
- LinkedIn: ${eventTitle}
- Newsletter: Sign up on our website`,

    welcomeLetter: `### Welcome to ${eventTitle}! 🎉

Dear Participant,

We are **thrilled** to have you join us for this exciting event!

#### Before You Arrive

Please make sure you have:
1. Confirmed your registration
2. Reviewed the program schedule
3. Prepared any questions you might have
4. Downloaded the event app (link in confirmation email)

#### What to Expect

You'll be joining a community of passionate individuals ready to learn, share, and grow together.

*See you soon!*

**The ${eventTitle} Team**`,

    informationRequest: `### Additional Information Request

To help us provide the best experience, please provide the following details:

#### Dietary Requirements
- Any allergies or dietary restrictions?
- Vegetarian/Vegan/Other preferences?

#### Accessibility Needs
- Do you require wheelchair access?
- Any other accessibility requirements?

#### Professional Background
- Current role and organization
- Years of experience in the field
- Specific topics of interest

#### Networking Preferences
- Would you like to be included in the participant directory?
- Interested in job opportunities?
- Open to mentoring others?

**Your information is kept confidential and used solely to improve your event experience.**`,

    certificateTitle: `${eventTitle} - Certificate of Completion`,
    certificateDescription: `This certificate acknowledges the successful completion of ${eventTitle}, demonstrating commitment to professional development and mastery of key concepts covered during the event.`,

    maxParticipants: 50,
    featuredImageUrl: 'https://picsum.photos/1200/600',
    featuredImageCaption: 'Join us for an unforgettable learning experience',
    city: location.city,
    location: location.venue,
    slug: '', // Will be auto-generated
  };
};

/**
 * Generate minimal test event data for quick tests
 */
export const generateMinimalTestEventData = (baseName: string): TestEventData => {
  return {
    title: baseName,
    headline: `${baseName} headline`,
    category: `${baseName} category`,
    description: `${baseName} description`,
    program: `${baseName} program`,
    practicalInformation: `${baseName} practical information`,
    moreInformation: `${baseName} more information`,
    welcomeLetter: `${baseName} welcome letter`,
    informationRequest: `${baseName} information request`,
    certificateTitle: `${baseName} certificateTitle`,
    certificateDescription: `${baseName} certificateDescription`,
    maxParticipants: 20,
    featuredImageUrl: 'https://picsum.photos/500/500',
    featuredImageCaption: 'This is a picsum image',
    city: `${baseName} city`,
    location: `${baseName} location`,
    slug: '', // Will be auto-generated
  };
};
