export type AppMode = "dating" | "bff";

export interface PromptCard {
  prompt: string;
  answer: string;
  likes: number;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  major: string;
  year: string;
  mode: AppMode;
  bio: string;
  interests: string[];
  photo: string;
  photoUrl?: string;
  photos?: { url: string; caption: string }[];
  coverPhotoIndex?: number;
  promptCards?: PromptCard[];
  distance: string;
  online: boolean;
  compatibility: number;
  isPro?: boolean;
  personality?: string;
  isVerified?: boolean;
  isDemo?: boolean;
}

export interface Match {
  id: string;
  profileId: string;
  matchedAt: string;
  lastMessage: string;
  unread: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface LikeReceived {
  id: string;
  profileId: string;
  likedCard: "photo" | "prompt";
  promptText?: string;
  comment: string;
  timestamp: string;
}

export const PROFILES: Profile[] = [
  {
    id: "1",
    name: "Maya",
    age: 21,
    major: "Computer Science",
    year: "3rd Year",
    mode: "dating",
    bio: "chai lover & hackathon addict ☕ building things that matter",
    interests: ["Coding", "Music", "Hiking", "Coffee"],
    photo: "https://picsum.photos/seed/maya/400/500",
    isVerified: true,
    photos: [
      {
        url: "https://picsum.photos/seed/maya/400/500",
        caption: "chai and code — my two loves ☕",
      },
      {
        url: "https://picsum.photos/seed/maya/400/500",
        caption: "hackathon winner 3 times in a row 🏆",
      },
      {
        url: "https://picsum.photos/seed/maya/400/500",
        caption: "weekend hikes keep me sane 🌿",
      },
      {
        url: "https://picsum.photos/seed/maya/400/500",
        caption: "spotify wrapped said I'm a sad girl lol 🎧",
      },
    ],
    promptCards: [
      {
        prompt: "My perfect weekend is…",
        answer:
          "Late morning chai, a long hike, then building something cool till midnight.",
        likes: 12,
      },
      {
        prompt: "I'll fall for you if…",
        answer: "You debate me on tabs vs spaces but still share your fries.",
        likes: 8,
      },
    ],
    distance: "2.1 km",
    online: true,
    compatibility: 94,
    isDemo: true,
  },
  {
    id: "2",
    name: "Aryan",
    age: 22,
    major: "Business",
    year: "4th Year",
    mode: "dating",
    bio: "basketball court to boardroom 🏀 aspiring founder",
    interests: ["Sports", "Finance", "Travel", "Startups"],
    photo: "https://picsum.photos/seed/aryan/400/500",
    isVerified: true,
    photos: [
      {
        url: "https://picsum.photos/seed/aryan/400/500",
        caption: "game day energy hits different 🏀",
      },
      {
        url: "https://picsum.photos/seed/aryan/400/500",
        caption: "my pitch deck won regionals 🚀",
      },
      {
        url: "https://picsum.photos/seed/aryan/400/500",
        caption: "solo trip to Manali was everything 🏔️",
      },
      {
        url: "https://picsum.photos/seed/aryan/400/500",
        caption: "coffee shop mornings before 8am lectures ☕",
      },
    ],
    promptCards: [
      {
        prompt: "A hot take I have…",
        answer: "Coffee shops are the real classrooms. Fight me.",
        likes: 15,
      },
      {
        prompt: "The most spontaneous thing I've done…",
        answer: "Booked a solo Manali trip at 11pm and left by 6am.",
        likes: 22,
      },
    ],
    distance: "0.8 km",
    online: true,
    compatibility: 87,
    isDemo: true,
  },
  {
    id: "3",
    name: "Priya",
    age: 20,
    major: "Design",
    year: "2nd Year",
    mode: "bff",
    bio: "figma and film 🎬 obsessed with visual stories",
    interests: ["Art", "Movies", "Yoga", "Photography"],
    photo: "https://picsum.photos/seed/priya/400/500",
    isVerified: false,
    photos: [
      {
        url: "https://picsum.photos/seed/priya/400/500",
        caption: "golden hour in the design studio 🎨",
      },
      {
        url: "https://picsum.photos/seed/priya/400/500",
        caption: "my film photography doesn't lie 📷",
      },
      {
        url: "https://picsum.photos/seed/priya/400/500",
        caption: "Sunday yoga then Sunday cinema 🧘",
      },
      {
        url: "https://picsum.photos/seed/priya/400/500",
        caption: "this mural took 3 weeks and I'd do it again 🖌️",
      },
    ],
    promptCards: [
      {
        prompt: "I get way too excited about…",
        answer: "Finding the perfect font for a project. It's a sickness.",
        likes: 19,
      },
    ],
    distance: "1.4 km",
    online: false,
    compatibility: 91,
    isDemo: true,
  },
  {
    id: "4",
    name: "Rohan",
    age: 23,
    major: "Engineering",
    year: "4th Year",
    mode: "dating",
    bio: "late nights debugging, early mornings running 🤖",
    interests: ["Robotics", "Gaming", "Coffee", "Cycling"],
    photo: "https://picsum.photos/seed/rohan/400/500",
    isVerified: true,
    photos: [
      {
        url: "https://picsum.photos/seed/rohan/400/500",
        caption: "my robot arm finally works 🤖",
      },
      {
        url: "https://picsum.photos/seed/rohan/400/500",
        caption: "5am cycling before exams hits 🚴",
      },
      {
        url: "https://picsum.photos/seed/rohan/400/500",
        caption: "gaming is a legitimate life skill 🎮",
      },
      {
        url: "https://picsum.photos/seed/rohan/400/500",
        caption: "late night lab sessions with the squad 🔬",
      },
    ],
    promptCards: [
      {
        prompt: "Two truths and a lie…",
        answer:
          "I've cycled 100km in a day. I can code in 4 languages. I've never watched anime.",
        likes: 31,
      },
      {
        prompt: "I'm looking for someone who…",
        answer: "Won't judge me for talking to my robot like it's a person.",
        likes: 14,
      },
    ],
    distance: "3.2 km",
    online: true,
    compatibility: 78,
    isDemo: true,
  },
  {
    id: "5",
    name: "Aisha",
    age: 21,
    major: "Law",
    year: "3rd Year",
    mode: "bff",
    bio: "debate club president 🏗️ passionate about justice",
    interests: ["Politics", "Reading", "Dance", "Travel"],
    photo: "https://picsum.photos/seed/aisha/400/500",
    isVerified: true,
    photos: [
      {
        url: "https://picsum.photos/seed/aisha/400/500",
        caption: "won nationals in debate last month 🏗️",
      },
      {
        url: "https://picsum.photos/seed/aisha/400/500",
        caption: "Bollywood dance at the college fest 💃",
      },
      {
        url: "https://picsum.photos/seed/aisha/400/500",
        caption: "my reading list never ends 📚",
      },
      {
        url: "https://picsum.photos/seed/aisha/400/500",
        caption: "solo trip to Delhi — found myself 🌍",
      },
    ],
    promptCards: [
      {
        prompt: "My perfect weekend is…",
        answer:
          "Debate prep in the morning, Bollywood dancing at night, zero regrets.",
        likes: 9,
      },
    ],
    distance: "0.5 km",
    online: true,
    compatibility: 85,
    isDemo: true,
  },
  {
    id: "6",
    name: "Dev",
    age: 24,
    major: "Medicine",
    year: "2nd Year",
    mode: "dating",
    bio: "saving lives one textbook at a time 🩺 guitar on weekends",
    interests: ["Healthcare", "Guitar", "Hiking", "Chess"],
    photo: "https://picsum.photos/seed/dev/400/500",
    isVerified: false,
    photos: [
      {
        url: "https://picsum.photos/seed/dev/400/500",
        caption: "first anatomy practical done 🩺",
      },
      {
        url: "https://picsum.photos/seed/dev/400/500",
        caption: "guitar sessions fix everything 🎸",
      },
      {
        url: "https://picsum.photos/seed/dev/400/500",
        caption: "chess is pure meditation ♟️",
      },
      {
        url: "https://picsum.photos/seed/dev/400/500",
        caption: "trekked 20km last Sunday — worth it 🤾",
      },
    ],
    promptCards: [
      {
        prompt: "I'll fall for you if…",
        answer: "You can hold a real conversation and also beat me at chess.",
        likes: 17,
      },
      {
        prompt: "A hot take I have…",
        answer: "Chess is a better date than any restaurant.",
        likes: 11,
      },
    ],
    distance: "4.1 km",
    online: false,
    compatibility: 82,
    isDemo: true,
  },
  {
    id: "7",
    name: "Sara",
    age: 22,
    major: "Arts",
    year: "3rd Year",
    mode: "bff",
    bio: "painting the world in bold colors 🎨 gallery hunter",
    interests: ["Painting", "Literature", "Cooking", "Concerts"],
    photo: "https://picsum.photos/seed/sara/400/500",
    isVerified: false,
    photos: [
      {
        url: "https://picsum.photos/seed/sara/400/500",
        caption: "my latest canvas still smells of acrylics 🎨",
      },
      {
        url: "https://picsum.photos/seed/sara/400/500",
        caption: "cooking for 10 people was chaotic but fun 🍳",
      },
      {
        url: "https://picsum.photos/seed/sara/400/500",
        caption: "front row at the indie concert last week 🎵",
      },
      {
        url: "https://picsum.photos/seed/sara/400/500",
        caption: "my poetry journal is almost full 📖",
      },
    ],
    promptCards: [
      {
        prompt: "I get way too excited about…",
        answer: "Finding a tiny indie gallery in an unexpected street corner.",
        likes: 7,
      },
      {
        prompt: "The most spontaneous thing I've done…",
        answer:
          "Painted a 6-foot canvas overnight because the mood hit at midnight.",
        likes: 25,
      },
    ],
    distance: "1.9 km",
    online: true,
    compatibility: 88,
    isDemo: true,
  },
  {
    id: "8",
    name: "Karan",
    age: 21,
    major: "Business",
    year: "2nd Year",
    mode: "dating",
    bio: "finance nerd by day, foodie by night 🍜 city explorer",
    interests: ["Finance", "Food", "Badminton", "Movies"],
    photo: "https://picsum.photos/seed/karan/400/500",
    isVerified: false,
    photos: [
      {
        url: "https://picsum.photos/seed/karan/400/500",
        caption: "discovered the best chaat in the city 🍜",
      },
      {
        url: "https://picsum.photos/seed/karan/400/500",
        caption: "badminton state level 2 years running 🏸",
      },
      {
        url: "https://picsum.photos/seed/karan/400/500",
        caption: "finance internship taught me more than lectures 💼",
      },
      {
        url: "https://picsum.photos/seed/karan/400/500",
        caption: "late night IMAX show with the crew 🎬",
      },
    ],
    promptCards: [
      {
        prompt: "Two truths and a lie…",
        answer:
          "I've tried food in 15 cities. I do 5am badminton. I've read every Warren Buffett book.",
        likes: 6,
      },
    ],
    distance: "2.7 km",
    online: false,
    compatibility: 76,
    isDemo: true,
    isPro: true,
  },
];

export const MOCK_LIKES_RECEIVED: LikeReceived[] = [
  {
    id: "l1",
    profileId: "1",
    likedCard: "photo",
    comment: "You have the best smile 😊",
    timestamp: "2h ago",
  },
  {
    id: "l2",
    profileId: "4",
    likedCard: "prompt",
    promptText: "Two truths and a lie…",
    comment: "Same!! I've cycled that too, let's compare notes",
    timestamp: "5h ago",
  },
  {
    id: "l3",
    profileId: "2",
    likedCard: "photo",
    comment: "",
    timestamp: "Yesterday",
  },
  {
    id: "l4",
    profileId: "7",
    likedCard: "prompt",
    promptText: "I get way too excited about…",
    comment: "This is literally me with bookshops 🥺",
    timestamp: "2d ago",
  },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: "m1",
    profileId: "3",
    matchedAt: "2h ago",
    lastMessage: "Hey! Love your design portfolio 🎨",
    unread: 2,
  },
  {
    id: "m2",
    profileId: "5",
    matchedAt: "1d ago",
    lastMessage: "That debate topic sounds fascinating!",
    unread: 0,
  },
  {
    id: "m3",
    profileId: "7",
    matchedAt: "3d ago",
    lastMessage: "We should check out that gallery together",
    unread: 1,
  },
];

export const MESSAGES: Record<string, Message[]> = {
  m1: [
    {
      id: "1",
      matchId: "m1",
      senderId: "3",
      text: "Hey! Love your design portfolio 🎨",
      timestamp: "2:10 PM",
    },
    {
      id: "2",
      matchId: "m1",
      senderId: "me",
      text: "Thank you! I saw your Figma work, insane skills 🔥",
      timestamp: "2:12 PM",
    },
    {
      id: "3",
      matchId: "m1",
      senderId: "3",
      text: "Haha we should totally collaborate on something!",
      timestamp: "2:13 PM",
    },
    {
      id: "4",
      matchId: "m1",
      senderId: "3",
      text: "Are you going to the design fest next week?",
      timestamp: "2:15 PM",
    },
  ],
  m2: [
    {
      id: "1",
      matchId: "m2",
      senderId: "5",
      text: "That debate topic sounds fascinating!",
      timestamp: "Yesterday",
    },
    {
      id: "2",
      matchId: "m2",
      senderId: "me",
      text: "Right? Constitutional rights in the digital age is so complex",
      timestamp: "Yesterday",
    },
  ],
  m3: [
    {
      id: "1",
      matchId: "m3",
      senderId: "me",
      text: "I love that gallery downtown",
      timestamp: "3 days ago",
    },
    {
      id: "2",
      matchId: "m3",
      senderId: "7",
      text: "We should check out that gallery together",
      timestamp: "3 days ago",
    },
  ],
};

export const ICEBREAKERS = [
  "If you could only eat one cuisine for a month, what would it be? 🍜",
  "What's your go-to study spot on campus? ☕",
  "Morning person or night owl? 🦉",
  "What's the last show you binged? 📺",
  "Dream travel destination this year? ✈️",
];

export const PERSONALITY_QUESTIONS = [
  {
    id: 1,
    category: "Introvert/Extrovert",
    text: "I feel energized after spending time with large groups of people.",
  },
  {
    id: 2,
    category: "Introvert/Extrovert",
    text: "I prefer deep one-on-one conversations over group hangouts.",
  },
  {
    id: 3,
    category: "Introvert/Extrovert",
    text: "I need alone time to recharge after socializing.",
  },
  {
    id: 4,
    category: "Communication Style",
    text: "I express my feelings openly and directly.",
  },
  {
    id: 5,
    category: "Communication Style",
    text: "I prefer texting over calling for casual conversations.",
  },
  {
    id: 6,
    category: "Communication Style",
    text: "I like sharing memes and humor to connect with others.",
  },
  {
    id: 7,
    category: "Relationship Goals",
    text: "I'm looking for a committed, long-term relationship.",
  },
  {
    id: 8,
    category: "Relationship Goals",
    text: "Friendship and trust are more important than romance initially.",
  },
  {
    id: 9,
    category: "Relationship Goals",
    text: "I value independence even within a relationship.",
  },
  {
    id: 10,
    category: "Values",
    text: "Family traditions and culture are very important to me.",
  },
  {
    id: 11,
    category: "Values",
    text: "I believe kindness and empathy are the most attractive qualities.",
  },
];

export const PERSONALITY_RESULTS: Record<
  string,
  { type: string; tags: string[]; description: string }
> = {
  high_intro: {
    type: "The Thoughtful Connector",
    tags: ["Introvert", "Deep Conversations", "Long-term", "Empathetic"],
    description:
      "You value meaningful connections over surface-level interactions. You attract people who appreciate depth and authenticity.",
  },
  high_extro: {
    type: "The Social Spark",
    tags: ["Extrovert", "Adventurous", "Fun-loving", "Spontaneous"],
    description:
      "Your energy lights up every room. You create connections effortlessly and bring joy wherever you go.",
  },
  balanced: {
    type: "The Versatile Vibe",
    tags: ["Ambivert", "Adaptable", "Curious", "Open-minded"],
    description:
      "You're perfectly balanced between worlds. You can vibe with anyone — the quiet introvert or the life of the party.",
  },
};

export const ADMIN_USERS = [
  {
    id: "u1",
    name: "Maya Sharma",
    email: "maya.sharma@dgu.ac.in",
    verified: true,
    pro: false,
    blocked: false,
  },
  {
    id: "u2",
    name: "Aryan Kapoor",
    email: "aryan.kapoor@dgu.ac.in",
    verified: true,
    pro: true,
    blocked: false,
  },
  {
    id: "u3",
    name: "Priya Menon",
    email: "priya.menon@dgu.ac.in",
    verified: true,
    pro: false,
    blocked: false,
  },
  {
    id: "u4",
    name: "Rohan Desai",
    email: "rohan.desai@dgu.ac.in",
    verified: false,
    pro: false,
    blocked: false,
  },
  {
    id: "u5",
    name: "Aisha Khan",
    email: "aisha.khan@dgu.ac.in",
    verified: true,
    pro: true,
    blocked: false,
  },
];

export const ADMIN_REPORTS = [
  {
    id: "r1",
    reporter: "Maya Sharma",
    reported: "Unknown User",
    reason: "Inappropriate messages",
    status: "pending",
  },
  {
    id: "r2",
    reporter: "Aryan Kapoor",
    reported: "Fake Account",
    reason: "Suspected fake profile",
    status: "pending",
  },
  {
    id: "r3",
    reporter: "Priya Menon",
    reported: "Spam Bot",
    reason: "Spam links in chat",
    status: "resolved",
  },
];

export const AVAILABLE_PROMPTS = [
  "My perfect weekend is…",
  "I'll fall for you if…",
  "Two truths and a lie…",
  "The most spontaneous thing I've done…",
  "I'm looking for someone who…",
  "A hot take I have…",
  "I get way too excited about…",
  "My love language is…",
  "You should know that I…",
];
