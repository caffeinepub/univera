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
  onlineStatus: "online" | "away" | "offline";
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
    interests: ["Coding", "Music", "Hiking", "Coffee", "Photography"],
    photo: "/assets/generated/maya-portrait.dim_400x500.jpg",
    isVerified: true,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/maya-portrait.dim_400x500.jpg",
        caption: "chai and code — my two loves ☕",
      },
      {
        url: "/assets/generated/maya-casual.dim_400x500.jpg",
        caption: "golden hour chai run with friends 😄",
      },
      {
        url: "/assets/generated/maya-library.dim_400x500.jpg",
        caption: "hackathon prep mode: on 💻",
      },
      {
        url: "/assets/generated/maya-cafe.dim_400x500.jpg",
        caption: "this cafe is basically my second home ☕",
      },
      {
        url: "/assets/generated/maya-hiking.dim_400x500.jpg",
        caption: "weekend hikes keep me sane 🌿",
      },
      {
        url: "/assets/generated/maya-lifestyle.dim_400x500.jpg",
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
    onlineStatus: "online",
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
    interests: ["Sports", "Finance", "Travel", "Startups", "Fitness"],
    photo: "/assets/generated/aryan-portrait.dim_400x500.jpg",
    isVerified: true,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/aryan-portrait.dim_400x500.jpg",
        caption: "game day energy hits different 🏀",
      },
      {
        url: "/assets/generated/aryan-basketball.dim_400x500.jpg",
        caption: "court is my second classroom 🏀",
      },
      {
        url: "/assets/generated/aryan-library.dim_400x500.jpg",
        caption: "my pitch deck won regionals 🚀",
      },
      {
        url: "/assets/generated/aryan-cafe.dim_400x500.jpg",
        caption: "coffee shop mornings before 8am lectures ☕",
      },
      {
        url: "/assets/generated/aryan-travel.dim_400x500.jpg",
        caption: "solo trip to Manali was everything 🏔️",
      },
      {
        url: "/assets/generated/aryan-lifestyle.dim_400x500.jpg",
        caption: "startups > lectures, always 💼",
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
    onlineStatus: "online",
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
    interests: ["Art", "Movies", "Yoga", "Photography", "Dance"],
    photo: "/assets/generated/priya-portrait.dim_400x500.jpg",
    isVerified: false,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/priya-portrait.dim_400x500.jpg",
        caption: "golden hour in the design studio 🎨",
      },
      {
        url: "/assets/generated/priya-casual.dim_400x500.jpg",
        caption: "design workshops are my happy place ✨",
      },
      {
        url: "/assets/generated/priya-studio.dim_400x500.jpg",
        caption: "figma open, dreams loading... 💻",
      },
      {
        url: "/assets/generated/priya-cafe.dim_400x500.jpg",
        caption: "sketchbook + cappuccino = perfect afternoon 🍵",
      },
      {
        url: "/assets/generated/priya-photography.dim_400x500.jpg",
        caption: "my film photography doesn't lie 📷",
      },
      {
        url: "/assets/generated/priya-yoga.dim_400x500.jpg",
        caption: "Sunday yoga then Sunday cinema 🧘",
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
    onlineStatus: "offline",
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
    interests: ["Robotics", "Gaming", "Coffee", "Cycling", "Books"],
    photo: "/assets/generated/rohan-portrait.dim_400x500.jpg",
    isVerified: true,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/rohan-portrait.dim_400x500.jpg",
        caption: "engineering is a lifestyle, not a major 🤖",
      },
      {
        url: "/assets/generated/rohan-cycling.dim_400x500.jpg",
        caption: "5am cycling before exams hits 🚴",
      },
      {
        url: "/assets/generated/rohan-lab.dim_400x500.jpg",
        caption: "my robot arm finally works 🦾",
      },
      {
        url: "/assets/generated/rohan-cafe.dim_400x500.jpg",
        caption: "late night lab sessions with the squad ☕",
      },
      {
        url: "/assets/generated/rohan-gaming.dim_400x500.jpg",
        caption: "gaming is a legitimate life skill 🎮",
      },
      {
        url: "/assets/generated/rohan-lifestyle.dim_400x500.jpg",
        caption: "rooftop sunsets = mandatory decompression 🌆",
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
    onlineStatus: "online",
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
    bio: "debate club president 🏛️ passionate about justice",
    interests: ["Politics", "Reading", "Dance", "Travel", "Cooking"],
    photo: "/assets/generated/aisha-portrait.dim_400x500.jpg",
    isVerified: true,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/aisha-portrait.dim_400x500.jpg",
        caption: "won nationals in debate last month 🏛️",
      },
      {
        url: "/assets/generated/aisha-dance.dim_400x500.jpg",
        caption: "Bollywood dance at the college fest 💃",
      },
      {
        url: "/assets/generated/aisha-library.dim_400x500.jpg",
        caption: "my reading list never ends 📚",
      },
      {
        url: "/assets/generated/aisha-cafe.dim_400x500.jpg",
        caption: "coffee dates and deep conversations ☕",
      },
      {
        url: "/assets/generated/aisha-debate.dim_400x500.jpg",
        caption: "justice is not optional 🎤",
      },
      {
        url: "/assets/generated/aisha-travel.dim_400x500.jpg",
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
    onlineStatus: "online",
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
    interests: ["Healthcare", "Guitar", "Hiking", "Chess", "Movies"],
    photo: "/assets/generated/dev-portrait.dim_400x500.jpg",
    isVerified: false,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/dev-portrait.dim_400x500.jpg",
        caption: "first anatomy practical done 🩺",
      },
      {
        url: "/assets/generated/dev-guitar.dim_400x500.jpg",
        caption: "guitar sessions fix everything 🎸",
      },
      {
        url: "/assets/generated/dev-library.dim_400x500.jpg",
        caption: "anatomy > everything else rn 📖",
      },
      {
        url: "/assets/generated/dev-chess.dim_400x500.jpg",
        caption: "chess is pure meditation ♟️",
      },
      {
        url: "/assets/generated/dev-trekking.dim_400x500.jpg",
        caption: "trekked 20km last Sunday — worth it 🏕️",
      },
      {
        url: "/assets/generated/dev-lifestyle.dim_400x500.jpg",
        caption: "rooftop sunsets after long shifts 🌇",
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
    onlineStatus: "offline",
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
    interests: ["Painting", "Literature", "Cooking", "Concerts", "Art"],
    photo: "/assets/generated/sara-portrait.dim_400x500.jpg",
    isVerified: false,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/sara-portrait.dim_400x500.jpg",
        caption: "art is the only language I need 🎨",
      },
      {
        url: "/assets/generated/sara-painting.dim_400x500.jpg",
        caption: "my latest canvas still smells of acrylics 🖌️",
      },
      {
        url: "/assets/generated/sara-library.dim_400x500.jpg",
        caption: "my poetry journal is almost full 📖",
      },
      {
        url: "/assets/generated/sara-cafe.dim_400x500.jpg",
        caption: "indie cafe + good book = paradise 📚",
      },
      {
        url: "/assets/generated/sara-concert.dim_400x500.jpg",
        caption: "front row at the indie concert last week 🎵",
      },
      {
        url: "/assets/generated/sara-cooking.dim_400x500.jpg",
        caption: "cooking for 10 people was chaotic but fun 🍳",
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
    onlineStatus: "online",
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
    interests: ["Finance", "Food", "Badminton", "Movies", "Travel"],
    photo: "/assets/generated/karan-portrait.dim_400x500.jpg",
    isVerified: false,
    coverPhotoIndex: 0,
    photos: [
      {
        url: "/assets/generated/karan-portrait.dim_400x500.jpg",
        caption: "finance internship taught me more than lectures 💼",
      },
      {
        url: "/assets/generated/karan-badminton.dim_400x500.jpg",
        caption: "badminton state level 2 years running 🏸",
      },
      {
        url: "/assets/generated/karan-library.dim_400x500.jpg",
        caption: "markets open, brain engaged 📊",
      },
      {
        url: "/assets/generated/karan-food.dim_400x500.jpg",
        caption: "discovered the best chaat in the city 🍜",
      },
      {
        url: "/assets/generated/karan-cinema.dim_400x500.jpg",
        caption: "late night IMAX show with the crew 🎬",
      },
      {
        url: "/assets/generated/karan-lifestyle.dim_400x500.jpg",
        caption: "city explorer, always finding hidden gems 🗺️",
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
    onlineStatus: "away",
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
