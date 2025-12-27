export const en = {
  header: {
    home: 'Home',
    blog: 'Journal',
    about: 'Profile',
    privateSpace: "Captain's Cabin",
    chat: 'Comms Link',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    profile: 'Personal Center',
    settings: 'System Settings',
    audit: 'System Audit',
    notifications: 'Alerts',
    clearAll: 'Clear All',
    emptyNotifications: 'No new alerts',
    footprint: 'Star Map',
    system: 'System Mgmt'
  },
  pwa: {
    title: 'Orion',
    desc: 'Install on home screen for better experience',
    install: 'Install',
    ios: "Tap share <i class='fas fa-share-square'></i> and select <b>'Add to Home Screen'</b>"
  },
  bottomNav: {
    home: 'Home',
    archives: 'Archives',
    cabin: 'Cabin',
    me: 'Me'
  },
  hero: {
    status: 'System Online',
    title1: 'Explore',
    title2: 'the Unknown',
    introPrefix: 'I am ',
    introName: 'Sam',
    introSuffix:
      '. Navigating the digital cosmos, building robust architectures, and exploring the frontiers of Artificial Intelligence.',
    ctaPrimary: 'Explore Journal',
    ctaSecondary: 'System Profile'
  },
  portfolio: {
    title: 'Portfolio',
    subtitle: 'A collection of engineering projects and professional history.',
    resume: 'Resume',
    projects: 'Projects',
    liveDemo: 'Live Demo',
    sourceCode: 'Source Code',
    demoOptions: {
      title: 'Select View Mode',
      local: 'Preview Here',
      newTab: 'New Tab',
      iframeTitle: 'Live Preview'
    }
  },
  blogList: {
    title: 'Journal & Insights',
    subtitle: 'Thoughts on technology, investment, and personal growth.',
    titlePrivate: 'Encrypted Vault',
    subtitlePrivate: 'Classified documentation and personal logs.',
    viewAll: 'View all logs',
    readArticle: 'Access Data',
    systemLog: 'System Log // Public Access',
    entries: 'ENTRIES',
    status: 'STATUS',
    online: 'ONLINE',
    searchPlaceholder: 'Search logs by keywords...',
    filter: 'Filter:',
    all: 'All',
    noLogs: 'No logs found',
    adjustSearch: 'Adjust your search parameters',
    clearFilters: 'Clear filters',
    page: 'PAGE'
  },
  auditLog: {
    title: 'System Activity Log',
    subtitle: 'Tracking all operational commands within the mainframe.',
    operator: 'Operator',
    action: 'Command',
    target: 'Target Object',
    time: 'Timestamp',
    ip: 'Source IP',
    noData: 'No activity recorded in current sector.'
  },
  pagination: {
    prev: 'Prev Sector',
    next: 'Next Sector',
    page: 'Sector'
  },
  login: {
    welcome: 'Identify Yourself',
    welcomeRegister: 'New Entity',
    welcomeReset: 'Reset Access',
    subtitle: 'Authenticate to access restricted sectors',
    subtitleRegister: 'Register to obtain clearance',
    subtitleReset: 'Use secret protocol to restore access',
    name: 'Codename',
    email: 'Comms Link',
    emailOrPhone: 'Email or Phone',
    phone: 'Phone Number',
    phoneError: 'Invalid format',
    password: 'Access Key',
    newPassword: 'New Key',
    secretKey: 'Secret Protocol Key',
    confirmPassword: 'Confirm Key',
    signin: 'Authenticate',
    register: 'Initialize',
    reset: 'Restore',
    toRegister: 'No clearance? Initialize',
    toLogin: 'Already authorized? Authenticate',
    forgotPassword: 'Lost Access Key?',
    backToLogin: 'Return to Auth',
    error: 'Authentication failed. Access denied.',
    passwordMismatch: 'Access Keys do not match.'
  },
  profile: {
    title: 'Personal Center',
    subtitle: 'Manage your identity and clearance details.',
    displayName: 'Display Name',
    email: 'Registered Email',
    phone: 'Phone Number',
    uid: 'Entity ID',
    save: 'Update Identity',
    developing: 'Module developing...',
    security: 'Security Protocol',
    changePassword: 'Change Access Key',
    oldPassword: 'Current Key',
    newPassword: 'New Key',
    admin: 'Admin Console',
    grantVip: 'Grant VIP Access',
    targetEmail: 'Target Entity Email',
    dataManagement: 'Data Management',
    exportLogs: 'Export Logs',
    active: 'Active',
    vipBadge: 'VIP',
    downloadBackup: 'Download a backup of all your personal logs in JSON format.',
    height: 'Height (cm)',
    fitnessGoal: 'Fitness Goal',
    barkUrl: 'Bark URL (Push)',
    barkUrlPlaceholder: 'https://api.day.app/your-key/...',
    timezone: 'Timezone',
    goals: {
      cut: 'Fat Loss (Cut)',
      bulk: 'Muscle Gain (Bulk)',
      maintain: 'Maintain'
    },
    role: 'Role Authority',
    updateRole: 'Update Role',
    roles: {
      user: 'User',
      admin: 'Admin',
      super_admin: 'Super Admin',
      bot: 'Bot (Immutable)'
    },
    accessControl: 'Access & Permissions',
    requestPermissionTitle: 'Request Permission',
    permissionKey: 'Permission Key',
    applyAdmin: 'Request Admin Role',
    customRequest: 'Custom Permission Request',
    reasonLabel: 'Request Reason',
    reasonPlaceholder: 'Please describe why you need this permission...',
    submitRequest: 'Submit Request'
  },
  settings: {
    title: 'System Config',
    subtitle: 'Adjust interface parameters and localization.',
    theme: 'Visual Interface',
    language: 'Language Protocol',
    light: 'Light Mode',
    dark: 'Dark Mode',
    en: 'English',
    zh: 'Chinese'
  },
  system: {
    title: 'System Management',
    subtitle: 'Dashboard for monitoring system resources and external services.',
    tabs: {
      resources: 'Resources',
      users: 'Users',
      roles: 'Roles',
      permissions: 'Permissions',
      requests: 'Requests'
    },
    cloudinary: {
      title: 'Cloudinary Image Library',
      credits: 'Credits Used',
      plan: 'Current Plan',
      storage: 'Storage',
      bandwidth: 'Bandwidth',
      objects: 'Objects',
      transformations: 'Transformations',
      resources: 'Total Resources',
      lastUpdated: 'Last Updated'
    },
    r2: {
      title: 'Cloudflare R2 Storage',
      tab_storage: 'Storage (R2)',
      tab_cloudinary: 'Media (Cloudinary)',
      plan: 'Free Tier Status',
      planDesc: 'Using Cloudflare R2 object storage. No egress fees.',
      storageUsage: 'Class A Ops',
      estCost: 'Est. Cost',
      overage: 'Overage',
      freeTier: 'Free Tier',
      images: 'Images',
      backups: 'Backups',
      others: 'Others',
      totalObjects: 'Total Objects',
      allBuckets: 'Across all buckets',
      distribution: 'Storage Distribution',
      empty: 'No files found in this bucket/prefix.',
      loadMore: 'Load More Files',
      upload: 'Upload File',
      deleteTitle: 'Delete File?',
      deleteMsg: 'Are you sure you want to permanently delete this file from {storage}?',
      deleteSuccess: 'File deleted successfully.',
      home: 'Home',
      folders: 'Folders'
    },
    backup: {
      terminalTitle: 'Database Backup Terminal',
      processing: 'Processing...',
      init: '> Initializing backup sequence...',
      reqDump: '> Requesting mongodump stream from server...',
      success: '> Backup stream complete. File downloaded.',
      terminated: '> Process terminated.',
      viewFiles: 'View Backups',
      wait: 'Please Wait...'
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      actions: 'Actions',
      update: 'Update'
    },
    requests: {
      title: 'Access Requests',
      pending: 'Pending',
      approve: 'Approve',
      reject: 'Reject',
      noPending: 'No pending requests.',
      permission: 'Requested Permission',
      reason: 'Reason'
    },
    roles: {
      title: 'Role Management',
      add: 'Add Role',
      edit: 'Edit Role',
      name: 'Role Name',
      desc: 'Description',
      perms: 'Permissions',
      save: 'Save Role',
      delete: 'Delete Role'
    },
    permissions: {
      title: 'Permission Registry',
      add: 'Add Permission',
      edit: 'Edit Permission',
      key: 'Key',
      name: 'Name',
      category: 'Category',
      desc: 'Description',
      save: 'Save Permission',
      delete: 'Delete Permission'
    },
    users: {
      search: 'Search users...',
      vipStatus: 'VIP Status',
      active: 'Active',
      inactive: 'Inactive',
      grant: 'Grant VIP',
      revoke: 'Revoke VIP',
      verifyTitle: 'Verify Authorization',
      verifyMsg: 'Please enter the secret key to confirm this action.',
      verifyBtn: 'Verify',
      role: 'Role',
      directPerms: 'Direct Permissions',
      botError: 'Cannot modify Bot account.'
    }
  },
  access: {
    denied: 'Access Denied',
    restricted: 'Restricted Area',
    message: 'You do not have the required security clearance to access this sector.',
    request: 'Request Access',
    requestTitle: 'Submit Access Request',
    submit: 'Submit Request',
    cancel: 'Cancel',
    pending: 'Access Request Pending',
    reasonPlaceholder: 'Please provide a valid reason...'
  },
  footprint: {
    title: 'Star Map',
    subtitle: 'Tracking footprints across the galaxy.',
    intro: "Illuminate the provinces you've explored and pin your memories on the global grid.",
    tabs: {
      china: 'China Sector',
      world: 'Global Markers'
    },
    stats: {
      total: 'Total Footprints',
      countries: 'Countries Visited',
      provinces: 'Provinces Lit',
      cities: 'Cities Reached'
    },
    add: 'Add Footprint',
    edit: 'Edit Footprint',
    form: {
      name: 'Place Name',
      province: 'Province / Region',
      city: 'City',
      date: 'Visit Date',
      mood: 'Mood',
      content: 'Memory / Note',
      photos: 'Photos',
      status: 'Status',
      visited: 'Visited',
      planned: 'Planned',
      save: 'Save Footprint'
    },
    mapTip: 'Click map to set coordinates'
  },
  resume: {
    role: 'Engineer / Voyager',
    bio: 'Focused on Tech, Investment, and Personal Growth.',
    credentials: 'Ex-Tencent & Lalamove Senior Dev',
    siteIntro: {
      title: 'System Architecture',
      subtitle: 'Overview of modules available in this digital space.',
      journalTitle: 'Public Journal',
      journalDesc:
        'My personal transmission log. Sharing insights on technology, code, and life experiences.',
      profileTitle: 'Captain Profile',
      profileDesc:
        'A dossier of my journey: Big Tech experience, startups, and financial exploration.',
      chatTitle: 'Interstellar Chat',
      chatDesc:
        'Real-time quantum link. Login required. Connect and chat with other voyagers in the system.',
      privateTitle: "Captain's Cabin",
      privateDesc:
        "Encrypted vault for my love story and personal memories. Strictly for Captain's eyes only (haha)."
    },
    websiteIntro: {
      title: 'Website Specification',
      description:
        'This platform is built with a micro-frontend architecture, utilizing React 18, TypeScript, and Tailwind CSS. It features a custom-built component library and a robust backend service.',
      viewSpecs: 'View System Specs',
      modalTitle: 'System Specifications',
      sections: {
        public: {
          title: 'Public Sector',
          desc: 'Accessible to all visitors.',
          features: [
            '<b>Blog Engine:</b> Markdown rendering, code highlighting.',
            '<b>Portfolio:</b> Interactive project showcase.',
            '<b>Performance:</b> SSR & Static Generation.'
          ]
        },
        private: {
          title: 'Private Sector',
          desc: 'Encrypted personal space.',
          features: [
            '<b>Journaling:</b> Rich text editor with auto-save.',
            '<b>Fitness Tracker:</b> Charts & calendar visualization.',
            '<b>Finance:</b> Asset tracking (Hidden).'
          ]
        },
        admin: {
          title: 'Command Center',
          desc: 'System administration.',
          features: [
            '<b>User Management:</b> RBAC & Permissions.',
            '<b>System Resources:</b> R2 & Cloudinary monitoring.',
            '<b>Audit Logs:</b> Security tracking.'
          ]
        },
        stack: {
          title: 'Tech Stack',
          list: [
            'React 18',
            'TypeScript',
            'Tailwind CSS',
            'Node.js',
            'MongoDB',
            'Redis',
            'Cloudflare R2'
          ]
        }
      }
    },
    orion: {
      etymology1: '(French: Gold)',
      etymology2: '(The Hunter)',
      description:
        'The brightest constellation in the night sky. A navigation star guiding you through the digital cosmos to discover your value.',
      slogan: 'Navigate Your Value'
    },
    education: 'Database: Education',
    educationSchool: 'Miami University',
    educationDegree: 'BA, Interactive Media Studies (STEM)',
    skills: 'Tech Stack',
    experience: 'Mission History',
    basedIn: 'Earth Orbit',
    gpa: "GPA: 3.7 • Dean's List",
    jobs: [
      {
        company: 'Gold Woodbath Capital',
        role: 'Founder / Investor',
        description:
          'Founded a private equity firm focused on technology and emerging markets. Managed portfolio strategies.',
        color: 'bg-amber-500'
      },
      {
        company: 'Lalamove',
        role: 'Senior Frontend Engineer',
        description:
          'Optimized core logistics dispatch system. Enhanced driver and user app webviews.',
        color: 'bg-orange-500'
      },
      {
        company: 'Tencent Cloud',
        role: 'Frontend Developer',
        description:
          'Led frontend development for Coding OA platform. Implemented DevOps toolchains.',
        color: 'bg-blue-500'
      },
      {
        company: 'BeeHex (NASA Spin-off)',
        role: 'Frontend Engineer',
        description:
          'Revolutionized food automation with 3D printing technology. Built custom Vue.js platform.',
        color: 'bg-slate-500'
      }
    ]
  },
  comments: {
    title: 'Comms Channel',
    placeholder: 'Transmit a message...',
    postButton: 'Send Transmission',
    loginToComment: 'Authenticate to transmit',
    noComments: 'No transmissions received.',
    reply: 'Reply',
    replyTo: 'Reply to',
    cancel: 'Abort',
    error: 'Transmission failed.'
  },
  chat: {
    title: 'Quantum Link',
    subtitle: 'Encrypted real-time subspace communication channel.',
    crewManifest: 'Crew Manifest',
    publicChannel: 'Public Channel',
    privateChannel: 'Private Channel',
    connecting: 'Establishing Uplink...',
    placeholder: 'Broadcast message...',
    typing: 'is transmitting...',
    send: 'Transmit',
    me: 'Me',
    welcome: 'Welcome to the Bridge',
    encrypted: 'Encrypted'
  },
  delete: {
    confirmTitle: 'Delete Log?',
    confirmMessage: 'This action is irreversible. To confirm deletion, please type:',
    confirmSecretMessage: 'Restricted Action. Enter Secret Key to authorize deletion:',
    button: 'Delete Log'
  },
  live: {
    title: 'Live Uplink',
    subtitle: 'Real-time neural interface active. Streaming audio/video data to Gemini Core.',
    connect: 'Initialize Link',
    disconnect: 'Terminate Link'
  },
  footer: {
    tagline: 'Refining digital experience through code and design.',
    rights: '© 2024 Sam Yao. System Operational.',
    builtBy: 'Built with Pride, Love and Peace by Sam Yao',
    strengthHonor: 'Strength & Honor'
  },
  privateSpace: {
    tabs: {
      secondBrain: 'Second Brain',
      journal: 'Journal',
      leisure: 'Leisure',
      gallery: 'Gallery',
      fitness: 'Fitness'
    },
    secondBrain: {
      title: 'Digital Twin',
      subtitle: 'Omniscient AI Core',
      welcome:
        'Hello. I am your Second Brain. I have access to your journal, fitness logs, and project data. How can I assist you?',
      placeholder: 'Ask me anything about your data...'
    },
    hotSearch: {
      title: 'News Center',
      hot: 'Trends',
      finance: 'Finance',
      game: 'Games',
      guonei: 'Domestic',
      world: 'World',
      updated: 'Updated',
      loading: 'Scanning network...'
    },
    leisure: {
      musicTitle: 'Sonic Player',
      playUrl: 'Play URL',
      search: 'Library',
      placeholderUrl: 'MP3 URL...',
      placeholderSearch: 'Search...',
      nowPlaying: 'Now Playing',
      stopped: 'Idle',
      mahjong: 'Mahjong Soul Zone',
      mahjongDesc: 'Accessing Maj-Soul network.',
      drawingBoard: 'Drawing Board',
      drawingDesc: 'Unleash your creativity.',
      clock: {
        title: 'Smart Hub',
        subtitle: 'Shenzhen Live'
      },
      cycle: {
        title: 'Moon Cycle',
        subtitle: 'Bio-Tracker',
        prediction: 'Prediction',
        nextPeriod: 'Next Period',
        inDays: 'in {days} days',
        log: 'Log Period',
        save: 'Save',
        flow: 'Flow',
        symptoms: 'Symptoms',
        note: 'Note',
        delete: 'Delete',
        startDate: 'Start Date',
        endDate: 'End Date',
        color: 'Color',
        flows: {
          light: 'Light',
          medium: 'Medium',
          heavy: 'Heavy'
        },
        symptomList: {
          cramps: 'Cramps',
          headache: 'Headache',
          backpain: 'Back Pain',
          fatigue: 'Fatigue',
          bloating: 'Bloating',
          acne: 'Acne',
          moody: 'Moody'
        },
        legend: {
          period: 'Period',
          predicted: 'Predicted',
          fertile: 'Fertile',
          ovulation: 'Ovulation'
        }
      },
      chefWheel: {
        title: 'AI Smart Kitchen',
        subtitle: 'Automated Meal Decision System',
        spin: 'SPIN',
        spinning: 'ANALYZING...',
        confirm: 'Confirm Selection',
        retry: 'Back & Retry',
        recommending: 'Gemini is suggesting...',
        recommendations: 'You might also like:',
        manage: 'Manage Menu',
        viewRecipe: 'View Recipe',
        searchMode: 'Recipe Search',
        wheelMode: 'Wheel Mode',
        backToSearch: 'Back to Search',
        searchPlaceholder: 'Search for a recipe (e.g. Kung Pao Chicken)...',
        searching: 'Searching...',
        library: 'Library Management',
        smartPlan: {
          button: 'AI Smart Plan',
          title: 'Smart Plan',
          nutritionist: 'AI Nutritionist',
          personalized: 'Personalized Menu Plan',
          target: 'Target',
          fallbackTitle: 'Priority Logic (Fallback)',
          fallback1:
            'If you logged your weight recently in Fitness, AI prioritizes the latest log.',
          fallback2:
            "If you explicitly set a different goal today (e.g. 'Bulk') in diet log, AI recommends for that goal.",
          error: 'Nutritionist AI is busy. Try again later.'
        },
        form: {
          add: 'Add Dish',
          edit: 'Edit Dish',
          name: 'Dish Name',
          image: 'Image URL',
          category: 'Category',
          tags: 'Tags',
          cancel: 'Cancel',
          save: 'Save'
        },
        filters: {
          healthy: 'Healthy Mode',
          cooldown: 'Variety Mode',
          category: 'Category',
          calories: 'Calories',
          tags: 'Tags',
          options: {
            any: 'Any',
            lunch: 'Lunch',
            dinner: 'Dinner',
            supper: 'Supper',
            low: 'Low Cal',
            medium: 'Medium',
            high: 'High Cal'
          },
          tooltips: {
            healthy: 'Prioritizes low-calorie and balanced meals.',
            variety: 'Avoids dishes eaten recently.'
          }
        },
        menu: {
          add: 'Add Dish',
          edit: 'Edit Dish',
          name: 'Dish Name',
          category: 'Category',
          weight: 'Priority (1-10)',
          calories: 'Calorie Level',
          save: 'Save Dish'
        },
        ingredients: {},
        styles: {},
        cats: {}
      },
      pirate: {
        title: 'The Four Pirate Lords',
        reset: 'Reshuffle',
        moves: 'Moves',
        victory: 'CONQUERED',
        victoryDesc: 'The seas are tamed.',
        playAgain: 'Play Again',
        rulesTitle: 'Mission Parameters',
        rules: [
          'Objective: Coordinate the 4 Factions (Red, Blue, Green, Yellow) to their home territories simultaneously.',
          'Home Territories: Red (Top-Left), Blue (Top-Right), Green (Bottom-Left), Yellow (Bottom-Right).',
          'Units: Each faction has 4 units (Captain, Ship, Treasure, Map). All 4 must be within their colored 3x3 zone.',
          'Neutral Zone: The central column and empty spaces allow movement.',
          'Difficulty: Hard. Requires forward planning.'
        ]
      }
    },
    fitness: {
      title: 'Fitness Space',
      subtitle: 'Track body & performance metrics.',
      goals: {
        cut: 'Fat Loss',
        bulk: 'Muscle Gain',
        maintain: 'Maintain'
      },
      calendar: {
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        holidays: {
          '1-1': 'New Year',
          '2-14': "Valentine's",
          '3-8': "Women's Day",
          '3-12': 'Arbor Day',
          '4-1': 'April Fools',
          '5-1': 'Labor Day',
          '5-4': 'Youth Day',
          '6-1': "Children's Day",
          '7-1': 'CPC Day',
          '8-1': 'Army Day',
          '9-10': "Teacher's Day",
          '10-1': 'National Day',
          '12-24': 'Xmas Eve',
          '12-25': 'Christmas'
        },
        terms: [
          'Minor Cold',
          'Major Cold',
          'Start of Spring',
          'Rain Water',
          'Awakening of Insects',
          'Spring Equinox',
          'Pure Brightness',
          'Grain Rain',
          'Start of Summer',
          'Grain Full',
          'Grain in Ear',
          'Summer Solstice',
          'Minor Heat',
          'Major Heat',
          'Start of Autumn',
          'End of Heat',
          'White Dew',
          'Autumn Equinox',
          'Cold Dew',
          "Frost's Descent",
          'Start of Winter',
          'Minor Snow',
          'Major Snow',
          'Winter Solstice'
        ],
        noActivity: 'No activity',
        summaryTitle: 'Daily Activity Summary'
      },
      photoWall: {
        title: 'Fitness Gallery',
        captured: '{n} Photos Captured This Month',
        empty: 'No photos for this range',
        view: 'View Day Photos',
        prev6: 'Prev 6 Mo',
        next6: 'Next 6 Mo'
      },
      stats: {
        progress: 'Progress',
        userProgress: "{name}'s Progress",
        activeProfile: 'Active Profile',
        loading: 'Loading...',
        loadMore: 'Load More',
        noData: 'No data collected yet'
      },
      input: {
        loggingFor: 'Logging for:',
        selectUser: 'Select User'
      },
      tabs: {
        workout: 'Activity',
        status: 'Body & Mood',
        diet: 'Diet',
        photos: 'Photos'
      },
      workout: {
        isDone: 'Task Done?',
        duration: 'Duration (min)',
        type: 'Activities',
        notes: 'Daily Highlights',
        types: {
          run: 'Run',
          swim: 'Swim',
          lift: 'Lift',
          yoga: 'Yoga',
          hiit: 'HIIT',
          trip: 'Trip',
          hike: 'Hike',
          movie: 'Movie',
          love: 'Love',
          other: 'Other'
        }
      },
      status: {
        weight: 'Weight (kg)',
        height: 'Height (cm)',
        sleep: 'Sleep (hours)',
        mood: 'Mood',
        moods: {
          happy: 'Happy',
          neutral: 'Neutral',
          bad: 'Bad'
        }
      },
      diet: {
        content: 'What did you eat?',
        contentPlaceholder: 'Breakfast: Bread, Milk...',
        water: 'Water Intake (ml)'
      },
      photos: {
        upload: 'Upload Moments',
        empty: 'No photos today'
      },
      charts: {
        weightTitle: 'Weight Trend',
        duration: 'Duration',
        weight: 'Weight',
        bmi: 'BMI'
      },
      save: 'Save Record',
      saved: 'Record Updated'
    },
    journal: 'Our Journal',
    memories: 'MEMORIES',
    together: 'Together',
    years: 'Years',
    days: 'Days',
    loveMsg: 'Love you forever! ❤',
    bucketList: {
      title: 'Bucket List',
      subtitle: 'Dreams & Goals',
      subtitleRoutine: 'Daily Habits',
      types: {
        wish: 'Wish',
        routine: 'Routine'
      },
      tabs: {
        todo: 'Wishes',
        in_progress: 'In Progress',
        done: 'Achieved'
      },
      actions: {
        start: 'Start',
        complete: 'Done',
        later: 'Later',
        wishlist: 'Wishlist',
        restart: 'Restart'
      },
      add: 'Make a Wish',
      edit: 'Edit Wish',
      placeholder: 'What is your dream?',
      description: 'Plan / Guide / Description',
      targetDate: 'Target Date',
      evidence: 'Evidence / Photos',
      uploadEvidence: 'Upload Photo',
      empty: 'No wishes yet. Dream big!',
      status: 'Current Status',
      save: 'Save Wish',
      update: 'Update Wish',
      delete: 'Delete Wish',
      priority: {
        label: 'Priority',
        active: 'Normal',
        timeSensitive: 'Urgent',
        passive: 'Passive',
        critical: 'Critical',
        desc: {
          active: 'Standard notification, lights up screen.',
          timeSensitive: 'High priority, breaks through focus modes.',
          passive: 'Silent notification, adds to list only.',
          critical: 'Maximum alert, plays continuous alarm sound.'
        }
      },
      sounds: {
        label: 'Notification Sound',
        none: 'None (Silence)',
        minuet: 'Minuet',
        alarm: 'Alarm',
        birdsong: 'Birdsong',
        glass: 'Glass',
        noir: 'Noir',
        fanfare: 'Fanfare',
        ladder: 'Ladder',
        bell: 'Bell',
        electronic: 'Electronic',
        horn: 'Horn',
        anticipate: 'Anticipate',
        bloom: 'Bloom',
        calypso: 'Calypso',
        chime: 'Chime',
        chao: 'Chao',
        descent: 'Descent',
        gotosleep: 'Go To Sleep',
        healthnotification: 'Health',
        mailsent: 'Mail Sent',
        multiwayinvitation: 'Invitation',
        newmail: 'New Mail',
        newsflash: 'News Flash',
        paymentsuccess: 'Payment Success',
        shake: 'Shake',
        sherwoodforest: 'Sherwood Forest',
        silence: 'Silence',
        spell: 'Spell',
        suspense: 'Suspense',
        telegraph: 'Telegraph',
        tiptoes: 'Tiptoes',
        typewriters: 'Typewriters',
        update: 'Update',
        desc: {
          silence: 'Muted.',
          minuet: 'Best for standard reminders.',
          alarm: 'Use for critical deadlines or wake up calls.',
          birdsong: 'Relaxing, good for breaks.',
          glass: 'Very short and subtle ping.',
          noir: 'Deep and mysterious.',
          fanfare: 'Success sound.',
          ladder: 'Rising tones.',
          bell: 'Simple ding.',
          electronic: 'Digital beep.',
          horn: 'Honk sound.',
          anticipate: 'Short notification.',
          bloom: 'Soft and pleasant.',
          calypso: 'Fun and upbeat.',
          chime: 'Ring tone.',
          chao: 'Fast paced.',
          descent: 'Dropping tone.',
          gotosleep: 'Soft lullaby.',
          healthnotification: 'Information alert.',
          mailsent: 'Swoosh sound.',
          multiwayinvitation: 'Ding Dong.',
          newmail: 'Classic mail.',
          newsflash: 'News alert.',
          paymentsuccess: 'Cash register.',
          shake: 'Rattle sound.',
          sherwoodforest: 'Forest horn.',
          spell: 'Magical.',
          suspense: 'Dramatic.',
          telegraph: 'Morse beep.',
          tiptoes: 'Quiet step.',
          typewriters: 'Key click.',
          update: 'Standard notify.'
        }
      },
      icons: {
        alarm: 'Alarm',
        calendar: 'Calendar',
        health: 'Health',
        mail: 'Mail',
        idea: 'Idea',
        task: 'Task',
        money: 'Money',
        travel: 'Travel',
        home: 'Home',
        game: 'Game',
        code: 'Code',
        music: 'Music',
        server: 'Server',
        book: 'Book'
      },
      notify: {
        label: 'Notify Users',
        select: 'Select Users...'
      },
      routine: {
        startTime: 'Start Time',
        rule: 'Recurrence Rule',
        nextRun: 'Next Run',
        recurrenceOptions: {
          none: 'One Time',
          m10: 'Every 10 Mins',
          m30: 'Every 30 Mins',
          h1: 'Every Hour',
          workday9to18: 'Workday (9-18)',
          dailyMorning: 'Daily 9 AM',
          daily12: 'Daily 12 PM',
          daily18: 'Daily 6 PM',
          mon8: 'Every Monday 8 AM',
          customDays: 'Custom (Cron)'
        },
        descriptions: {
          none: 'Trigger once at specified time.',
          m10: 'Repeats every 10 minutes.',
          m30: 'Repeats every 30 minutes.',
          h1: 'Repeats hourly.',
          workday9to18: 'Mon-Fri, hourly from 09:00 to 18:00.',
          daily8: 'Every day at 09:00 AM.',
          daily12: 'Every day at 12:00 PM.',
          daily18: 'Every day at 18:00 PM.',
          mon8: 'Every Monday at 8 AM.',
          custom: 'Use advanced Cron syntax.'
        },
        config: {
          bark: 'Bark Notification Config',
          test: 'Test Push',
          testing: 'Sending...',
          icon: 'Icon URL',
          url: 'Jump URL',
          urlPlaceholder: 'scheme:// or https://',
          image: 'Image URL',
          callMode: 'Continuous Ring (Call Mode)'
        }
      },
      config: {
        bark: 'Bark Notification Config',
        test: 'Test Push',
        testing: 'Sending...',
        icon: 'Icon URL',
        url: 'Jump URL',
        urlPlaceholder: 'scheme:// or https://',
        image: 'Image URL',
        callMode: 'Continuous Ring (Call Mode)'
      }
    },
    tasks: 'Tasks',
    newTask: 'New Task...',
    caughtUp: "You're all caught up!",
    emptyJournal: 'Journal is empty.',
    writeFirst: 'Write your first memory on the right.',
    read: 'Read',
    preview: 'No preview...',
    unknownDate: 'Unknown Date',
    editor: {
      titlePlaceholder: 'Title...',
      author: 'Author',
      tags: 'Tags (space separated)',
      private: 'Private',
      public: 'Public',
      summary: 'Summary',
      code: 'Code / Script',
      publish: 'Publish Entry',
      update: 'Update Entry',
      cancel: 'Cancel Edit',
      chars: 'Chars',
      tellStory: 'Tell your story...',
      saving: 'Saving...',
      saved: 'Saved',
      saveDraft: 'Save Draft',
      processing: 'Processing...'
    },
    gallery: {
      title: 'Capsule Gallery',
      subtitle: 'Eternal moments connected by light.',
      upload: 'Upload Photo',
      caption: 'Caption',
      location: 'Location',
      save: 'Pin It',
      cancel: 'Discard',
      replace: 'Replace Image',
      delete: 'Delete',
      deleteConfirm: 'Remove Photo?',
      pinTitle: 'Record Memory',
      captionLabel: 'Title',
      captionPlaceholder: 'Name this memory...',
      dateLabel: 'Date',
      pinButton: 'Pin It',
      developing: 'Developing Photo...',
      reserved: 'Reserved'
    },
    articleView: {
      back: 'Back to Insights',
      ctaTitle: 'End of Transmission',
      ctaMessage:
        'Resonating with this signal? Boost the frequency with a like, or broadcast the link to your network.',
      like: 'Like',
      liked: 'Liked',
      share: 'Share Link',
      copied: 'Link Copied'
    }
  }
};
