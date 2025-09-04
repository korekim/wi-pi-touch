export interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  content: string;
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
}

export const mockEmails: Email[] = [
  // PRIMARY EMAILS
  {
    id: 1,
    sender: "sarah.johnson@techcorp.com",
    subject: "Q3 Budget Review Meeting - Tomorrow 2PM",
    preview: "Hi team, just a reminder about our quarterly budget review meeting...",
    time: "10:30 AM",
    isRead: false,
    category: 'primary',
    content: `Hi Team,

Just a reminder about our quarterly budget review meeting scheduled for tomorrow (September 5th) at 2:00 PM in Conference Room B.

Agenda:
1. Q3 Performance Analysis
2. Department Budget Allocations
3. Q4 Planning & Projections
4. New Initiative Proposals

Please bring your department reports and budget requests.

Best regards,
Sarah Johnson
Finance Director, TechCorp`
  },
  {
    id: 2,
    sender: "billing@microsoft.com",
    subject: "Microsoft 365 Business - Payment Due September 10",
    preview: "Your subscription payment is due in 6 days. Ensure uninterrupted access...",
    time: "9:15 AM",
    isRead: true,
    category: 'primary',
    content: `Dear Subscriber,

Your Microsoft 365 Business Premium subscription payment is due on September 10, 2025.

Subscription Details:
- Plan: Microsoft 365 Business Premium
- Users: 12
- Monthly Cost: $264.00
- Next Billing Date: September 10, 2025

To ensure uninterrupted access to Microsoft 365 apps and services, please verify your payment method.

[Update Payment Method]

Microsoft Billing Team`
  },
  {
    id: 3,
    sender: "security@company-portal.com",
    subject: "Security Alert: New device login detected",
    preview: "We detected a login from a new device on your account...",
    time: "Yesterday",
    isRead: false,
    category: 'primary',
    content: `Security Alert

We detected a login from a new device on your company portal account.

Device Details:
- Device: MacBook Pro (macOS 14.6)
- Location: San Francisco, CA, USA
- IP Address: 192.168.1.47
- Time: September 3, 2025 at 11:42 PM PST

If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.

[Secure My Account] [Not Me]

IT Security Team`
  },
  {
    id: 4,
    sender: "noreply@workday.com",
    subject: "Timesheet Approval Required - Due Today",
    preview: "Your timesheet for the week ending September 1st requires approval...",
    time: "Yesterday",
    isRead: false,
    category: 'primary',
    content: `Hello,

Your timesheet for the week ending September 1st, 2025 requires your manager's approval.

Week Summary:
- Regular Hours: 40.0
- Overtime Hours: 2.5
- PTO Hours: 0.0
- Total Hours: 42.5

Please review and submit for approval by end of business today to ensure timely payroll processing.

[Review Timesheet] [Submit for Approval]

Workday System`
  },
  {
    id: 5,
    sender: "it-helpdesk@company.com",
    subject: "System Maintenance - Tonight 11PM-2AM",
    preview: "Scheduled maintenance will affect email and file sharing services...",
    time: "2 hours ago",
    isRead: true,
    category: 'primary',
    content: `System Maintenance Notice

Scheduled system maintenance will occur tonight from 11:00 PM to 2:00 AM PST.

Affected Services:
• Email servers (Outlook/Exchange)
• File sharing (SharePoint/OneDrive)
• VPN access
• Video conferencing (Teams)

Please save all work and log out before 11:00 PM. Services will be restored by 2:00 AM.

For urgent IT support during maintenance, call: (555) 123-4567

IT Support Team`
  },
  {
    id: 6,
    sender: "hr@techcorp.com",
    subject: "Annual Performance Review - Schedule Your Meeting",
    preview: "It's time for your annual performance review. Please schedule a meeting...",
    time: "3 hours ago",
    isRead: false,
    category: 'primary',
    content: `Dear Team Member,

It's time for your annual performance review! Please schedule a meeting with your manager by September 15th.

Review Process:
1. Complete self-assessment form (due Sept 10th)
2. Schedule 60-minute meeting with manager
3. Discuss goals, achievements, and development plans
4. Set objectives for next year

Access the performance review portal to get started.

[Access Portal] [Download Self-Assessment Form]

Human Resources Department`
  },

  // SOCIAL EMAILS
  {
    id: 7,
    sender: "notifications@linkedin.com",
    subject: "You have 8 new connection requests",
    preview: "John Smith, Sarah Davis, Michael Chen and 5 others want to connect...",
    time: "2 hours ago",
    isRead: false,
    category: 'social',
    content: `Hi there,

You have new connection requests on LinkedIn:

👤 John Smith - Senior Software Engineer at Google
👤 Sarah Davis - Product Marketing Manager at Apple  
👤 Michael Chen - Data Scientist at Tesla
👤 Emma Wilson - UX Designer at Meta
👤 David Park - DevOps Engineer at Amazon
👤 Lisa Zhang - AI Researcher at OpenAI
👤 Mark Johnson - CTO at Startup Inc
👤 Jessica Brown - Sales Director at Salesforce

View and respond to these requests to grow your professional network.

[View All Connection Requests]

Keep growing your network!
LinkedIn Team`
  },
  {
    id: 8,
    sender: "noreply@facebook.com",
    subject: "Jake posted 3 new photos from his trip",
    preview: "Jake shared photos from his vacation in Hawaii...",
    time: "4 hours ago",
    isRead: true,
    category: 'social',
    content: `Hi,

Your friend Jake Kim posted 3 new photos from his trip to Hawaii.

"Amazing sunset at Waikiki Beach! 🌅 Day 3 of paradise #Hawaii #Vacation #Paradise"

Photos include:
📷 Sunset over Diamond Head
📷 Snorkeling at Hanauma Bay  
📷 Traditional Hawaiian food spread

[View Photos] [Comment] [Like]

You're receiving this because you're friends with Jake Kim on Facebook.

Facebook Team`
  },
  {
    id: 9,
    sender: "notify@twitter.com",
    subject: "Weekly summary: 52 new followers, trending tweet",
    preview: "Here's what happened on your Twitter account this week...",
    time: "Yesterday",
    isRead: false,
    category: 'social',
    content: `Your Weekly Twitter Summary

Here's what happened on your account this week:

📈 +52 new followers (up 15% from last week)
💬 31 replies to your tweets
🔄 203 retweets of your content
❤️ 3,247 likes on your tweets
📊 47,832 total impressions

Top performing tweet:
"Just solved a 3-day debugging nightmare with a single line change. The joy and frustration of coding in one moment! 🐛➡️✨ #coding #debugging #softwaredevelopment"
→ 487 likes, 42 retweets, 28 replies

Trending hashtags you used: #coding, #AI, #techindustry

[View Full Analytics] [Create New Tweet]

Twitter Team`
  },
  {
    id: 10,
    sender: "updates@instagram.com",
    subject: "Your story has 247 views and 15 new followers",
    preview: "Your latest story is performing well! See who viewed it...",
    time: "Yesterday",
    isRead: true,
    category: 'social',
    content: `Story Performance Update

Your story from yesterday is performing great!

📊 Story Stats:
• 247 total views
• 23 story replies
• 15 profile visits
• 8 website clicks

New Followers (15):
@techguru_sarah, @codemaster_mike, @designpro_emma, @startup_david, and 11 others viewed your story and followed you.

Most engaged content:
"Behind the scenes of our product development process 💻✨"

[View Story Insights] [Create New Story]

Instagram Team`
  },
  {
    id: 11,
    sender: "community@github.com",
    subject: "Your repository got 15 new stars this week",
    preview: "wi-pi-touch is gaining traction! New contributors and issues...",
    time: "2 days ago",
    isRead: false,
    category: 'social',
    content: `Repository Update: wi-pi-touch

Great news! Your repository is gaining traction in the developer community.

📊 This Week's Activity:
⭐ 15 new stars (total: 127)
🍴 4 new forks
👁️ 89 new watchers
🔧 3 new pull requests
🐛 2 new issues reported

Top Contributors:
• @securitydev - Fixed authentication bug
• @wifiexpert - Added new attack vectors
• @uimaster - Improved interface design

Trending in: #cybersecurity #penetrationtesting #wifi

[View Repository] [Manage Issues] [Review Pull Requests]

GitHub Team`
  },
  {
    id: 12,
    sender: "digest@reddit.com",
    subject: "Top posts from r/cybersecurity and r/programming",
    preview: "Your daily digest of trending posts from communities you follow...",
    time: "3 days ago",
    isRead: true,
    category: 'social',
    content: `Your Daily Reddit Digest

Here are the top posts from communities you follow:

🔐 r/cybersecurity (2.1M members)
"New WiFi vulnerability discovered in WPA3 - affects all modern routers"
↗️ 1.2k upvotes, 87 comments

💻 r/programming (3.5M members)  
"I built a network penetration testing tool in Python - GitHub link inside"
↗️ 892 upvotes, 134 comments

🛡️ r/netsec (1.8M members)
"DEFCON 32 highlights: Best talks on wireless security"
↗️ 654 upvotes, 45 comments

💡 r/learncybersecurity (450k members)
"Complete roadmap for becoming a penetration tester in 2025"
↗️ 543 upvotes, 89 comments

[View All Posts] [Customize Digest]

Reddit Team`
  },

  // PROMOTIONS
  {
    id: 13,
    sender: "deals@amazon.com",
    subject: "🔥 Lightning Deal: 65% off Tech Essentials - 3 hours left!",
    preview: "Limited time offer on MacBook Pro, iPhone 15, AirPods and more...",
    time: "3 hours ago",
    isRead: false,
    category: 'promotions',
    content: `⚡ LIGHTNING DEAL ALERT! ⚡

65% OFF Tech Essentials - Only 3 hours left!

🔥 MEGA DEALS:
📱 iPhone 15 Pro Max 1TB - $649 (was $1,599) - 87% claimed
💻 MacBook Pro 16" M3 Max - $1,399 (was $3,999) - 92% claimed
🎧 AirPods Pro (2nd Gen) - $89 (was $249) - 76% claimed  
⌚ Apple Watch Ultra 2 - $299 (was $799) - 68% claimed
📺 Samsung 85" Neo QLED 8K - $1,299 (was $4,999) - 45% claimed
🎮 PlayStation 5 Pro - $399 (was $699) - 94% claimed

⏰ Sale ends at 2:00 PM TODAY!
🚚 FREE same-day delivery 
💳 0% APR for 12 months with Amazon Card

[SHOP NOW - EXTREMELY LIMITED STOCK]

⚠️ These prices won't last - most items 90%+ claimed!

Amazon Lightning Deals Team`
  },
  {
    id: 14,
    sender: "offers@bestbuy.com",
    subject: "Member Exclusive: Early Black Friday - 70% off everything",
    preview: "Get first access to our biggest deals of the year + free installation...",
    time: "6 hours ago",
    isRead: true,
    category: 'promotions',
    content: `🛍️ MEMBER EXCLUSIVE BLACK FRIDAY PREVIEW 🛍️

You're invited to our biggest sale of the year - 48 hours early access!

💥 DOORBUSTER DEALS:

Gaming Zone:
🎮 PlayStation 5 Slim + Spider-Man 2 - $349 (save $200)
🎮 Xbox Series X + Game Pass Ultimate - $369 (save $180)
🎮 Nintendo Switch OLED + Zelda Bundle - $249 (save $120)
🖥️ ASUS ROG 27" Gaming Monitor 240Hz - $199 (save $400)

Computing Department:
💻 Dell XPS 13 Plus - $699 (save $600)
💻 HP Spectre x360 2-in-1 - $799 (save $500)
🖨️ Canon All-in-One Printer + 2 Years Ink - $89 (save $310)

Smart Home:
🏠 Ring Doorbell Pro 2 + Echo Show 8 - $149 (save $200)
💡 Philips Hue Starter Kit (12 bulbs) - $99 (save $250)

✨ PLUS: Free Geek Squad installation on everything!
🚚 Free shipping + 60-day returns

[Shop Early Access Deals] [Download Best Buy App for Extra 10% Off]

Best Buy Membership Team`
  },
  {
    id: 15,
    sender: "promotions@spotify.com",
    subject: "🎵 Premium Free Trial + 60% off for 12 months",
    preview: "Limited time offer: Try Premium free, then save big for a full year...",
    time: "1 day ago",
    isRead: false,
    category: 'promotions',
    content: `🎵 BIGGEST SPOTIFY OFFER EVER! 🎵

Special Limited-Time Offer (expires in 2 days):

🎁 3 months FREE trial
💰 Then 60% OFF for 12 months
🎯 Only $3.99/month (normally $9.99)
📈 Save $72 in your first year!

Premium Features You'll Love:
✓ Ad-free music streaming
✓ Download 10,000+ songs for offline listening
✓ Unlimited skips and replays
✓ High-quality audio (320kbps)
✓ Play any song, anytime, anywhere
✓ Access to over 100 million songs
✓ Exclusive podcasts and audiobooks
✓ DJ mode for seamless mixing

🌟 NEW: AI-powered personalized playlists
🎧 NEW: Spatial audio support
🎤 NEW: Real-time lyrics with karaoke mode

This exclusive offer is only available to select users and expires September 6th!

[Start Your Free Trial] [Learn More About Premium]

🎶 Don't miss out - this is our best deal of 2025!

Spotify Premium Team`
  },
  {
    id: 16,
    sender: "sales@adobe.com",
    subject: "Creative Cloud All Apps - 50% off student discount",
    preview: "Get access to Photoshop, Premiere Pro, After Effects and 17+ more apps...",
    time: "2 days ago",
    isRead: true,
    category: 'promotions',
    content: `🎨 STUDENT CREATIVE CLOUD DEAL 🎨

Limited Time: 50% Off Creative Cloud All Apps

Regular Price: $59.99/month
Student Price: $29.99/month (first year)
You Save: $360 per year!

✨ Get Access to 20+ Industry-Leading Apps:
📸 Photoshop - Photo editing & design
🎬 Premiere Pro - Video editing
🎞️ After Effects - Motion graphics & VFX
🎨 Illustrator - Vector graphics & logos
📖 InDesign - Layout & publishing
🌐 Dreamweaver - Web development
📊 Animate - Interactive animations
🔊 Audition - Audio editing & mixing

PLUS: 
☁️ 100GB cloud storage
🎓 Portfolio website with custom domain
🖥️ Adobe Fonts - 20,000+ fonts
📚 Step-by-step tutorials & learning resources
🤝 Community access & networking

Valid .edu email required for verification.

[Verify Student Status] [Start Free 7-Day Trial]

Adobe Education Team`
  },
  {
    id: 17,
    sender: "deals@newegg.com",
    subject: "Build Your Dream PC - Components up to 80% off",
    preview: "RTX 4090, Intel i9, 64GB RAM and more at insane prices...",
    time: "2 days ago",
    isRead: false,
    category: 'promotions',
    content: `🖥️ ULTIMATE PC BUILDER SALE 🖥️

Build Your Dream Gaming/Workstation PC - Components up to 80% OFF!

🔥 GPU DEALS:
• RTX 4090 24GB - $999 (was $1,599) - Perfect for 4K gaming
• RTX 4080 16GB - $699 (was $1,199) - Great for 1440p
• RTX 4070 Ti 12GB - $499 (was $799) - Ideal for 1080p+

⚡ CPU POWERHOUSE:
• Intel i9-14900K - $399 (was $599) - 24 cores, 5.6GHz boost
• AMD Ryzen 9 7950X - $449 (was $699) - 16 cores, incredible performance
• Intel i7-14700K - $299 (was $419) - Sweet spot for gaming

💾 MEMORY & STORAGE:
• Corsair 64GB DDR5-6000 - $199 (was $399)
• Samsung 980 Pro 2TB NVMe - $149 (was $299)
• WD Black 4TB NVMe - $249 (was $499)

🏠 MOTHERBOARDS & CASES:
• ASUS ROG Strix Z790 - $199 (was $399)
• MSI Gaming Case RGB - $79 (was $159)
• Corsair 850W Gold PSU - $99 (was $179)

🎁 Bundle Deals Available:
Complete RTX 4090 build starting at $2,299 (was $3,899)

Free assembly service + 3-year warranty on complete builds!

[Build Your PC] [See All Component Deals]

Newegg PC Building Team`
  },
  {
    id: 18,
    sender: "offers@nordvpn.com",
    subject: "🔒 2 Years + 4 Months Free - 73% off NordVPN",
    preview: "Ultimate privacy protection for all your devices + bonus features...",
    time: "3 days ago",
    isRead: true,
    category: 'promotions',
    content: `🔒 ULTIMATE PRIVACY PROTECTION DEAL 🔒

Get 2 Years + 4 Months FREE (73% OFF!)

🌍 What You Get:
✓ Ultra-fast VPN for unlimited devices
✓ 5,000+ servers in 60+ countries
✓ Military-grade encryption
✓ No-logs policy (independently audited)
✓ 24/7 customer support

🎁 BONUS FEATURES INCLUDED:
🛡️ Threat Protection - Blocks ads, trackers & malware
🔐 Dark Web Monitoring - Alerts if your data is compromised  
📂 1TB Cloud Storage - Secure file backup
🔑 Password Manager - Generate & store passwords
💳 Identity Theft Protection - Monitor your personal info

💰 PRICING:
Regular: $11.99/month
Sale Price: $3.19/month (billed every 2 years)
Total Savings: $280 over 2 years!

Perfect for:
• Secure remote work
• Safe public WiFi usage
• Accessing geo-blocked content
• Anonymous browsing
• Protecting personal data

30-day money-back guarantee included!

[Get NordVPN Deal] [Compare Plans]

Stay safe online!
NordVPN Security Team`
  },

  // UPDATES
  {
    id: 19,
    sender: "noreply@apple.com",
    subject: "macOS Sonoma 14.7.1 - Critical Security Update Available",
    preview: "This update includes important security fixes and performance improvements...",
    time: "2 days ago",
    isRead: true,
    category: 'updates',
    content: `macOS Sonoma 14.7.1 Security Update

This update includes critical security fixes and performance improvements for your Mac.

🔒 Security Fixes:
• CVE-2025-12345: Safari WebKit vulnerability patched
• CVE-2025-12346: Kernel privilege escalation fixed
• CVE-2025-12347: Wi-Fi security improvements
• CVE-2025-12348: Bluetooth connection security enhanced

⚡ Performance Improvements:
• Faster app launch times on M3 chips
• Improved battery life optimization
• Enhanced memory management
• Better thermal management

🐛 Bug Fixes:
• Mail app sync issues resolved
• Calendar notifications now working properly
• Screen sharing stability improved
• External display detection fixed

📱 Compatibility:
• Better iPhone 15 integration
• Improved AirDrop reliability
• Enhanced Handoff features

Update Size: 2.8 GB
Installation Time: 30-45 minutes
Restart Required: Yes

[Update Now] [Schedule for Tonight] [Learn More]

⚠️ We recommend installing this update as soon as possible for optimal security.

Apple Software Update`
  },
  {
    id: 20,
    sender: "updates@slack.com",
    subject: "New Slack features: AI Assistant, Canvas 2.0, Advanced Analytics",
    preview: "Major update now available with AI-powered productivity tools...",
    time: "3 days ago",
    isRead: false,
    category: 'updates',
    content: `🎉 MAJOR SLACK UPDATE AVAILABLE! 🎉

Version 4.35.0 brings game-changing features to your workspace:

🤖 NEW: Slack AI Assistant
• Summarize long conversations instantly
• Draft professional messages with AI
• Find information across all channels
• Generate meeting notes automatically
• Smart thread recommendations

📝 Canvas 2.0 - Enhanced Visual Collaboration
• Real-time collaborative whiteboards
• Drag-and-drop media integration
• Template library (project plans, brainstorms, etc.)
• Advanced drawing and annotation tools
• Integration with Figma and Miro

📊 Advanced Workspace Analytics
• Team productivity insights
• Channel engagement metrics
• Response time analysis
• Custom reporting dashboards
• Usage trends and recommendations

🔧 Additional Improvements:
• 50% faster message loading
• Enhanced search with filters
• Improved video call quality
• New emoji reactions pack
• Better mobile notifications

🎯 Admin Features:
• Granular permission controls
• Automated compliance reporting
• Advanced user management
• Single sign-on improvements

These features are now available to all team members in your workspace.

[Explore New Features] [Watch Demo Videos] [Admin Settings]

Questions? Our support team is here to help!

Slack Product Team`
  },
  {
    id: 21,
    sender: "security@adobe.com",
    subject: "Critical Security Update: Creative Cloud - Update Required",
    preview: "Important security update for Photoshop, Illustrator, and other CC apps...",
    time: "1 week ago",
    isRead: true,
    category: 'updates',
    content: `🚨 CRITICAL SECURITY UPDATE REQUIRED 🚨

Adobe Creative Cloud Security Update - Version 2025.09

This critical update addresses multiple security vulnerabilities across Creative Cloud applications.

🛡️ Security Fixes Include:
• Photoshop: Memory corruption vulnerability (CVE-2025-9876)
• Illustrator: Code execution flaw patched (CVE-2025-9877)  
• Premiere Pro: File format security issue resolved (CVE-2025-9878)
• After Effects: Plugin security enhancement (CVE-2025-9879)
• InDesign: Document parsing vulnerability fixed (CVE-2025-9880)

⚠️ Risk Level: HIGH
These vulnerabilities could allow malicious files to execute code on your system.

📦 What's Updated:
• Photoshop 2025 (v26.1.1)
• Illustrator 2025 (v29.1.1)
• Premiere Pro 2025 (v25.1.1)
• After Effects 2025 (v24.1.1)
• InDesign 2025 (v20.1.1)
• Bridge 2025 (v14.1.1)

💾 Update Details:
• Total Download Size: 1.2 GB
• Installation Time: 15-25 minutes
• Restart Required: Yes (for some apps)
• Automatic Backup: Enabled

🔄 Update Methods:
1. Creative Cloud Desktop App (recommended)
2. Manual download from Adobe website
3. Enterprise Admin Console (for teams)

[Update All Apps Now] [Schedule Update] [Enterprise Admin Console]

⚡ IMPORTANT: Please update immediately to maintain security and compliance.

For technical support: 1-800-833-6687

Adobe Security Response Team`
  },
  {
    id: 22,
    sender: "updates@microsoft.com",
    subject: "Windows 11 23H2 Feature Update - Enhanced AI and Security",
    preview: "Major Windows update with Copilot integration, security improvements...",
    time: "1 week ago",
    isRead: false,
    category: 'updates',
    content: `🪟 WINDOWS 11 FEATURE UPDATE AVAILABLE 🪟

Windows 11 Version 23H2 - September 2025 Feature Update

🤖 NEW AI-POWERED FEATURES:
• Windows Copilot Pro integration
• AI-enhanced search and file organization
• Smart screenshot analysis and OCR
• Voice-to-text improvements
• Predictive typing across all apps

🔒 ENHANCED SECURITY:
• Advanced threat protection
• Improved Windows Defender
• Enhanced firewall with AI detection
• Secure Boot v3.0
• Biometric authentication improvements

⚡ PERFORMANCE UPGRADES:
• 25% faster startup times
• Improved memory management
• Better CPU utilization
• Enhanced gaming performance
• Optimized for latest Intel/AMD processors

🎨 DESIGN & USABILITY:
• Redesigned Start menu with AI suggestions
• New dynamic themes and wallpapers
• Improved multitasking with snap layouts
• Enhanced virtual desktop management
• Better touch and pen input support

🌐 CONNECTIVITY:
• Wi-Fi 7 support
• Bluetooth 5.4 compatibility
• Enhanced mobile hotspot features
• Improved VPN management
• Better cloud integration

📊 SYSTEM REQUIREMENTS:
• At least 4GB RAM (8GB recommended)
• 64GB storage space (for update)
• TPM 2.0 enabled
• UEFI firmware with Secure Boot

⏱️ UPDATE DETAILS:
• Download Size: 3.2 GB
• Installation Time: 45-90 minutes
• Multiple restart required
• Automatic backup created

[Download and Install] [Schedule for Tonight] [Learn More About Features]

Windows Update Team`
  },
  {
    id: 23,
    sender: "noreply@docker.com",
    subject: "Docker Desktop 4.25 - New container management features",
    preview: "Latest update brings improved performance and development tools...",
    time: "5 days ago",
    isRead: true,
    category: 'updates',
    content: `🐳 DOCKER DESKTOP 4.25 UPDATE 🐳

Major update now available with significant improvements for developers:

⚡ PERFORMANCE ENHANCEMENTS:
• 40% faster container startup times
• Reduced memory usage by 30%
• Improved disk space management
• Optimized image building process
• Better resource allocation

🛠️ NEW DEVELOPMENT FEATURES:
• Live container editing with hot reload
• Enhanced debugging tools
• Integrated terminal with container access
• Visual container dependency mapping
• One-click environment replication

📊 MANAGEMENT IMPROVEMENTS:
• New dashboard with real-time metrics
• Container health monitoring
• Automated cleanup recommendations
• Advanced logging and troubleshooting
• Multi-platform build support

🔧 DEVELOPER EXPERIENCE:
• VS Code integration improvements
• Better IntelliSense for Dockerfiles
• Compose file validation and suggestions
• Template library for common setups
• Improved error messages and hints

🌐 ENTERPRISE FEATURES:
• Enhanced security scanning
• Policy compliance checking
• Team collaboration tools
• Centralized registry management
• Usage analytics and reporting

🐛 BUG FIXES:
• Fixed volume mounting issues on Windows
• Resolved networking problems with WSL2
• Improved stability on Apple Silicon
• Fixed Docker Compose compatibility issues

💾 Update Size: 485 MB
⏱️ Installation: 5-10 minutes

[Update Docker Desktop] [View Release Notes] [Migration Guide]

Happy containerizing!
Docker Team`
  },
  {
    id: 24,
    sender: "updates@github.com",
    subject: "GitHub Enterprise - New code security and collaboration features",
    preview: "Enhanced Copilot Enterprise, advanced security scanning, and team tools...",
    time: "1 week ago",
    isRead: false,
    category: 'updates',
    content: `🚀 GITHUB ENTERPRISE UPDATE 🚀

New features and improvements for your organization:

🤖 GITHUB COPILOT ENTERPRISE:
• Custom model training on your codebase
• Organization-wide code completion
• Advanced refactoring suggestions
• Documentation generation
• Code review automation
• Security vulnerability detection

🔒 ADVANCED SECURITY:
• Real-time dependency scanning
• Custom security policies
• Advanced threat detection
• Supply chain security analysis
• Automated vulnerability patching
• Compliance reporting dashboard

👥 ENHANCED COLLABORATION:
• Improved code review workflows
• Team performance analytics
• Project management integration
• Advanced branch protection rules
• Custom automation workflows
• Better merge conflict resolution

📊 ENTERPRISE ANALYTICS:
• Developer productivity insights
• Code quality metrics
• Repository health scores
• Team collaboration patterns
• Security posture reporting
• Custom KPI dashboards

🛠️ ADMINISTRATION:
• Enhanced user management
• Granular access controls
• Audit log improvements
• Single sign-on enhancements
• API rate limit management
• Backup and disaster recovery

🌟 NOTABLE IMPROVEMENTS:
• 50% faster repository cloning
• Improved search across large codebases
• Better mobile experience
• Enhanced notification management
• Faster CI/CD pipeline execution

These updates are automatically available to all Enterprise customers.

[Access New Features] [Admin Dashboard] [Training Resources]

GitHub Enterprise Team`
  },

  // FORUMS EMAILS
  {
    id: 101,
    sender: "reddit@reddit.com",
    subject: "r/technology: Weekly Discussion Thread",
    preview: "Join the conversation about this week's biggest tech stories...",
    time: "2:15 PM",
    isRead: false,
    category: 'forums',
    content: `Weekly Discussion Thread - r/technology

This week's most discussed topics:
• AI breakthrough in quantum computing
• New cybersecurity threats emerging
• Tech industry layoffs continue
• Electric vehicle market updates

Join the discussion: https://reddit.com/r/technology

Popular this week:
- "Apple's new chip design leaked" (2.4k comments)
- "Meta's latest VR announcement" (1.8k comments)
- "Tesla's autonomous driving update" (3.1k comments)

Stay engaged with the tech community!

The r/technology Mod Team`
  },
  {
    id: 102,
    sender: "noreply@stackoverflow.com",
    subject: "Your question received 5 new answers",
    preview: "How to implement JWT authentication in Node.js - 5 new responses...",
    time: "1:45 PM",
    isRead: true,
    category: 'forums',
    content: `Your question has received new activity!

Question: "How to implement JWT authentication in Node.js with Express?"

5 new answers have been posted since yesterday:

★ Top-rated answer by @DevExpert2024 (Score: 24)
"The best approach is to use the jsonwebtoken library..."

★ Recent answer by @NodeMaster (Score: 12)
"Here's a complete implementation with middleware..."

★ Answer by @SecurityPro (Score: 8)
"Don't forget to implement proper token refresh logic..."

View all answers: https://stackoverflow.com/questions/your-question

Keep learning!
Stack Overflow Team`
  },
  {
    id: 103,
    sender: "notifications@discord.com",
    subject: "New messages in #dev-chat",
    preview: "12 new messages from WebDev Community server...",
    time: "12:30 PM",
    isRead: false,
    category: 'forums',
    content: `New Activity in WebDev Community

#dev-chat channel has 12 new messages:

💬 @CodeNinja: "Anyone working with Next.js 14 App Router?"
💬 @ReactDev: "Just shipped a new feature using server actions"
💬 @FullStackJoe: "Check out this cool CSS animation I made"
💬 @BackendBuddy: "PostgreSQL vs MongoDB for new project?"

#job-board channel has 3 new job postings:
🔥 Senior React Developer - RemoteTech Inc.
🔥 Full Stack Engineer - StartupXYZ
🔥 DevOps Engineer - CloudCorp

Join the conversation: https://discord.gg/webdev-community

WebDev Community Server`
  }];

export const categoryInfo = {
  primary: { name: 'Primary', icon: '📧', description: 'Important messages' },
  social: { name: 'Social', icon: '👥', description: 'Social networks and updates' },
  promotions: { name: 'Promotions', icon: '🏷️', description: 'Deals and offers' },
  updates: { name: 'Updates', icon: '🔔', description: 'Software and service updates' },
  forums: { name: 'Forums', icon: '💬', description: 'Community discussions and forums' }
};
