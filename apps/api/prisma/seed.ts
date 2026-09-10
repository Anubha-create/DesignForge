import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DesignForge database...');

  // 1. Create or upsert Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'architect@designforge.dev' },
    update: {},
    create: {
      id: 'demo-user-1',
      username: 'senior_architect',
      email: 'architect@designforge.dev',
      role: 'LEARNER'
    }
  });

  console.log(`Demo user ready: ${demoUser.username} (${demoUser.id})`);

  // 2. Define the 5 interview problems
  const problemsData = [
    {
      id: 'prob-parking-lot',
      title: 'Parking Lot System',
      slug: 'parking-lot',
      difficulty: 'MEDIUM',
      estimatedTime: '25 MIN',
      summary: 'Design a multi-level, automated parking garage supporting multiple vehicle types, slot allocation policies, and dynamic ticket pricing.',
      problemStatement: 'Design an automated multi-floor parking lot system that efficiently manages parking spots of various sizes, allocates spots based on vehicle dimensions, issues tickets upon entry, calculates fees on exit according to customizable pricing strategies, and updates spot occupancy in real-time.',
      functionalRequirements: JSON.stringify([
        'Support multiple vehicle types: Motorcycle/Bike, Compact Car, Large SUV, and Heavy Truck.',
        'Support multiple spot types matching or exceeding vehicle size requirements (Motorcycle, Compact, Large).',
        'Support multiple parking floors with real-time capacity and occupancy tracking per floor.',
        'Issue a unique time-stamped ticket upon entry with assigned spot identifier.',
        'Calculate parking duration and fee upon exit with pluggable pricing strategies (e.g. flat rate, hourly tiered, surge).',
        'Process payments (Cash, Credit Card) and release parking spot back to available pool upon completion.'
      ]),
      designExpectations: JSON.stringify([
        'Apply Single Responsibility Principle: decouple spot allocation from pricing and payment.',
        'Use Strategy Pattern for dynamic fee calculation.',
        'Use Factory Pattern for spot allocation and vehicle creation if appropriate.',
        'Ensure thread-safe spot assignment to prevent double-booking concurrent entries.',
        'Decouple payment gateway interaction behind a polymorphic interface.'
      ]),
      constraints: JSON.stringify([
        'Peak entry throughput: up to 10 vehicles per second across 4 entry gates.',
        'Maximum 5 floors, 200 spots per floor.',
        'System must remain operational in offline mode for cash payments if external payment gateway fails.'
      ]),
      edgeCases: JSON.stringify([
        'Parking lot is completely full when vehicle arrives.',
        'Vehicle attempts to exit without a valid ticket (lost ticket penalty handling).',
        'Vehicle occupies a spot larger than its minimum requirement when exact size is unavailable.',
        'Payment fails at exit gate while queue builds behind vehicle.'
      ]),
      clarifyingQuestions: JSON.stringify([
        'Q: Can large vehicles park across multiple compact spots? A: No, vehicles must fit within a single appropriately sized spot.',
        'Q: Are electric charging spots required initially? A: No, but the system must easily accommodate future charging requirements.',
        'Q: Can pricing rules differ between weekends and weekdays? A: Yes, fee calculation should be decoupled from the core lot manager.'
      ]),
      suggestedConcepts: JSON.stringify([
        'Strategy Pattern (Pricing)',
        'Factory Pattern (Vehicle/Spot)',
        'Observer Pattern (Display Boards)',
        'Composition over Inheritance'
      ]),
      hiddenRubricNotes: JSON.stringify([
        'Heavy penalty if ParkingLot class directly calculates pricing or processes credit cards.',
        'Reward encapsulation of spot state (isAvailable, vehicle reference, floorId).',
        'Reward separation between Ticket (immutable record) and ParkingReceipt (payment confirmation).'
      ]),
      requirementChange: JSON.stringify({
        id: 'rc-parking-ev',
        title: 'Electric Vehicle (EV) Charging Stations',
        scenario: 'The parking facility has installed specialized 50kW DC fast chargers on Floor 1. Electric vehicles require charging station allocation, charge rate metering, and combined parking + electricity billing upon exit.',
        newRequirement: 'Support EV vehicle classification, assign EV-capable spots with charging hardware telemetry, and incorporate energy consumption into checkout invoicing.',
        architecturalImpactHint: 'Avoid modifying Vehicle and Spot base classes directly; evaluate Decorator or polymorphic ChargeableSpot abstractions.',
        edgeCases: [
          'Non-EV vehicle attempts to park in an EV charging bay.',
          'EV completes charging but remains parked for additional hours (idle fee penalty).'
        ]
      })
    },
    {
      id: 'prob-elevator-system',
      title: 'Elevator Control System',
      slug: 'elevator-system',
      difficulty: 'HARD',
      estimatedTime: '35 MIN',
      summary: 'Design a distributed elevator control system managing multiple elevator cars, internal/external requests, and optimal dispatch algorithms.',
      problemStatement: 'Design an elevator controller for a modern 40-story commercial skyscraper with 6 elevator cars. The system must process hall calls (up/down requests from floors) and car calls (floor buttons pressed inside cars), optimizing for minimal passenger wait time, balanced car utilization, and power efficiency.',
      functionalRequirements: JSON.stringify([
        'Support external hall call panels on every floor with Up and Down buttons.',
        'Support internal car panels with floor selection buttons, emergency stop, and door controls.',
        'Dispatch algorithms (e.g. SCAN, LOOK, or Shortest Seek Time) to assign elevator cars to requests.',
        'Track elevator status: Current floor, Direction (UP, DOWN, IDLE), State (MOVING, STOPPED, MAINTENANCE), Door status (OPEN, CLOSED).',
        'Process weight sensor telemetry and prevent movement if maximum weight limit is exceeded.'
      ]),
      designExpectations: JSON.stringify([
        'Decouple elevator car mechanics from supervisory dispatch scheduling.',
        'Use State Pattern to model Elevator lifecycle states and legal transitions.',
        'Use Strategy Pattern for dispatching algorithms (allowing algorithm swapping between peak/off-peak hours).',
        'Apply Observer Pattern to broadcast car arrival events to display panels and floor chimes.'
      ]),
      constraints: JSON.stringify([
        '40 floors, 6 elevator cars.',
        'Car maximum capacity: 1500 kg (~18 passengers).',
        'Elevator travel speed: 2 floors per second.'
      ]),
      edgeCases: JSON.stringify([
        'Emergency stop button triggered while car is moving between floors.',
        'Simultaneous hall calls on floor 20 for UP and DOWN while cars are scattered.',
        'Power failure triggering fail-safe emergency descent to ground floor.'
      ]),
      clarifyingQuestions: JSON.stringify([
        'Q: Can one car handle both freight and passenger transit? A: All 6 cars are identical passenger elevators.',
        'Q: Is destination dispatch (selecting floor before entering) supported? A: Standard hall call up/down initially; extensible to destination dispatch.'
      ]),
      suggestedConcepts: JSON.stringify([
        'State Pattern (ElevatorState)',
        'Strategy Pattern (DispatchStrategy)',
        'Observer Pattern (FloorArrivalListener)',
        'Command Pattern (ButtonPressRequests)'
      ]),
      hiddenRubricNotes: JSON.stringify([
        'Deduct points if ElevatorController directly loops over cars with hardcoded if/else logic.',
        'Evaluate whether State pattern cleanly prevents door opening while car is in MOVING state.'
      ]),
      requirementChange: JSON.stringify({
        id: 'rc-elevator-vip',
        title: 'VIP Express Override & Fire Emergency Dispatch',
        scenario: 'Penthouse executives require an RFID keycard override that immediately cancels all pending stops and sends Car 1 non-stop to Floor 40. Additionally, building fire alarm telemetry must immediately force all cars to ground level and lock doors open.',
        newRequirement: 'Support prioritized emergency and VIP preemption without destabilizing normal passenger request queues.',
        architecturalImpactHint: 'Check if Request priority queue or Command interceptor pattern allows preemption without rewriting the Dispatcher.',
        edgeCases: [
          'Fire alarm occurs while VIP override is actively in progress.',
          'Car is between floors 35 and 36 when VIP call to floor 10 is initiated.'
        ]
      })
    },
    {
      id: 'prob-vending-machine',
      title: 'Vending Machine',
      slug: 'vending-machine',
      difficulty: 'EASY',
      estimatedTime: '20 MIN',
      summary: 'Design a coin/card-operated snack vending machine with inventory tracking, change calculation, and state management.',
      problemStatement: 'Design the software control system for an automated vending machine. The system displays available items and prices, accepts payment in coins, notes, or credit card, manages item dispensing and inventory replenishment, returns correct change, and safely handles cancellations and out-of-stock scenarios.',
      functionalRequirements: JSON.stringify([
        'Maintain item inventory slots with item code, name, price, and available count.',
        'Accept payment inputs: Coins (5c, 10c, 25c, $1) and Paper Bills ($1, $5).',
        'State workflow: Ready/Idle -> HasMoney -> SelectionMade -> Dispensing -> ChangeReturned.',
        'Calculate and dispense minimum coin change using available cash reserves in the machine.',
        'Support cancel button to refund all inserted currency before dispensing.'
      ]),
      designExpectations: JSON.stringify([
        'Use State Pattern to prevent illegal actions (e.g. dispensing before full payment, changing selection during dispensing).',
        'Decouple payment reconciliation from item inventory management.',
        'Handle coin change calculation with a greedy or dynamic-programming change dispenser algorithm.'
      ]),
      constraints: JSON.stringify([
        'Machine holds up to 30 unique product slots, each holding up to 10 units.',
        'Maximum bill denomination accepted: $20.'
      ]),
      edgeCases: JSON.stringify([
        'User inserts money for an item that just went out of stock.',
        'Machine lacks sufficient coins to return exact change.',
        'Item mechanical sensor detects item got stuck and failed to drop.'
      ]),
      clarifyingQuestions: JSON.stringify([
        'Q: What happens if coin dispenser runs out of quarters? A: Warn user "Exact Change Only" or reject transaction if change cannot be paid.'
      ]),
      suggestedConcepts: JSON.stringify([
        'State Pattern (VendingMachineState)',
        'Inventory Manager',
        'Payment Processor'
      ]),
      hiddenRubricNotes: JSON.stringify([
        'Watch out for boolean flag state hell (e.g. isDispensing, hasMoney, isCanceled). State pattern is expected.',
        'Verify transaction atomicity: money deducted only after successful mechanical drop sensor trigger.'
      ]),
      requirementChange: JSON.stringify({
        id: 'rc-vending-dynamic-pricing',
        title: 'Digital NFC Wallet & Surge Demand Pricing',
        scenario: 'The vending machine is upgraded with an Apple/Google Pay NFC terminal and connected to campus temperature sensors. Cold beverages should dynamically increase price by 15% during peak hot hours.',
        newRequirement: 'Support contactless digital payment tokens and pluggable dynamic pricing multipliers without altering physical slot hardware logic.',
        architecturalImpactHint: 'Abstract pricing calculation behind a PricingPolicy and payment through a unified PaymentMethod interface.',
        edgeCases: [
          'NFC tap times out during network drop.',
          'Price changes between when user selects item and taps their phone.'
        ]
      })
    },
    {
      id: 'prob-library-management',
      title: 'Library Management System',
      slug: 'library-management',
      difficulty: 'MEDIUM',
      estimatedTime: '25 MIN',
      summary: 'Design a municipal library catalog and lending system supporting book reservations, fine policies, and member borrowing limits.',
      problemStatement: 'Design an automated municipal library management system. The system manages physical book items and catalog metadata, tracks rack locations, handles member checkouts, returns, and reservations, enforces borrowing limits by membership tier, and computes overdue fines based on item category.',
      functionalRequirements: JSON.stringify([
        'Catalog books by ISBN, title, authors, subject, and barcode identifiers for physical copies.',
        'Support member accounts with active lending limits (e.g., max 5 books for standard members).',
        'Checkout book copies with automatic due date computation (e.g., 14 days standard).',
        'Manage reservations queue when all physical copies of a requested book are currently on loan.',
        'Calculate overdue fines automatically upon return based on lending duration and book type.'
      ]),
      designExpectations: JSON.stringify([
        'Clear separation between Book (catalog metadata) and BookItem (physical copy with barcode and rack location).',
        'Polymorphic fine calculation policy (Reference books vs Fiction vs DVDs).',
        'Observer pattern for notifying members when a reserved book is checked back in.'
      ]),
      constraints: JSON.stringify([
        'Catalog supports up to 100,000 distinct titles and 500,000 physical copies.',
        'Maximum fine capped at replacement cost of the book.'
      ]),
      edgeCases: JSON.stringify([
        'Member with overdue fine attempts to check out an additional book.',
        'Multiple members reserve the same popular book copy simultaneously.',
        'Book item reported lost or damaged during loan period.'
      ]),
      clarifyingQuestions: JSON.stringify([
        'Q: Can members renew a book? A: Yes, if no other member has placed an active reservation.'
      ]),
      suggestedConcepts: JSON.stringify([
        'Separation of Specification vs Instance (Book vs BookItem)',
        'Strategy Pattern (FineCalculation)',
        'Observer Pattern (ReservationNotifier)'
      ]),
      hiddenRubricNotes: JSON.stringify([
        'Severe deduction if Book contains barcode, rack location, and borrower ID (conflating Book and BookItem).',
        'Look for clean member borrowing policy encapsulation.'
      ]),
      requirementChange: JSON.stringify({
        id: 'rc-library-ebooks',
        title: 'E-Book Digital Lending with DRM & Concurrent Licenses',
        scenario: 'The library introduces digital e-books and audiobooks. Unlike physical books, e-books do not have physical rack locations or barcodes; they have concurrent checkout licenses (e.g. max 3 users at once) and automatically revoke access after 14 days without fines.',
        newRequirement: 'Integrate digital media lending alongside physical books while respecting concurrency limits and zero-fine return policies.',
        architecturalImpactHint: 'Abstract LendableItem interface or hierarchy so PhysicalBookItem and DigitalMediaItem can diverge gracefully.',
        edgeCases: [
          'User device clock is altered to bypass 14-day DRM expiration.',
          'All 3 digital licenses are currently checked out when a 4th request arrives.'
        ]
      })
    },
    {
      id: 'prob-notification-system',
      title: 'Multi-Channel Notification System',
      slug: 'notification-system',
      difficulty: 'HARD',
      estimatedTime: '30 MIN',
      summary: 'Design an enterprise notification dispatch platform supporting multi-channel delivery (Email, SMS, Push), priority queues, and rate-limiting.',
      problemStatement: 'Design an enterprise-grade notification service capable of dispatching millions of transactional and promotional messages across multiple delivery channels (Email via SendGrid/SES, SMS via Twilio, Mobile Push via FCM/APNS, and In-App inbox). The platform must handle templating, user channel preferences, delivery retries, rate limiting, and priority routing.',
      functionalRequirements: JSON.stringify([
        'Support multiple notification channels: Email, SMS, Mobile Push, and In-App.',
        'Render dynamic templates with parameter substitution and locale support.',
        'Respect user notification preferences (e.g. Marketing via Email only, Security alerts via SMS immediately).',
        'Support priority levels: CRITICAL (bypasses quiet hours, immediate dispatch) vs NORMAL (queued).',
        'Handle provider failure with exponential backoff and channel fallback (e.g. Push fails -> fallback to SMS).'
      ]),
      designExpectations: JSON.stringify([
        'Apply Adapter Pattern to integrate heterogeneous external provider SDKs (Twilio, SendGrid, FCM).',
        'Apply Strategy Pattern for channel routing and fallback selection.',
        'Use Decorator or Middleware Pattern for rate-limiting, logging, and template rendering.',
        'Ensure idempotency to avoid duplicate notifications on network retries.'
      ]),
      constraints: JSON.stringify([
        'Peak delivery volume: 5,000 messages per second.',
        'SMS throughput capped by provider at 50 messages per second (requires rate-limiting queue).'
      ]),
      edgeCases: JSON.stringify([
        'User triggered password reset SMS while carrier gateway is experiencing an outage.',
        'Non-critical marketing notification triggered during user local quiet hours (10 PM - 8 AM).',
        'Malformed template parameters triggering rendering exception.'
      ]),
      clarifyingQuestions: JSON.stringify([
        'Q: How are unsubscribe requests handled? A: User preferences must be evaluated before attempting channel dispatch.'
      ]),
      suggestedConcepts: JSON.stringify([
        'Adapter Pattern (Third-party Providers)',
        'Decorator Pattern (Rate Limiting/Retry)',
        'Strategy Pattern (Channel Dispatcher)',
        'Chain of Responsibility (Delivery Pipeline)'
      ]),
      hiddenRubricNotes: JSON.stringify([
        'Deduct heavily if direct Twilio or SendGrid SDK calls are hardcoded in the NotificationManager.',
        'Look for clean separation of Notification payload, TemplateRenderer, and ChannelSender.'
      ]),
      requirementChange: JSON.stringify({
        id: 'rc-notification-fallback',
        title: 'Intelligent Multi-Channel Fallback & Quiet-Hour Buffering',
        scenario: 'Clients demand a cascade fallback rule: attempt Mobile Push; if unacknowledged within 90 seconds, dispatch SMS; if carrier rejects, send Email. In addition, messages queued during a recipient’s local quiet hours must be scheduled for release at 8:00 AM local time.',
        newRequirement: 'Implement a cascade routing pipeline and time-zone-aware delivery scheduler without blocking the primary ingestion queue.',
        architecturalImpactHint: 'Apply Chain of Responsibility for fallback cascade, and separate ScheduledDispatcher from synchronous worker pool.',
        edgeCases: [
          'Push notification delivered after 95 seconds just as the SMS fallback was dispatched.',
          'Recipient changes time zone during travel while message is in quiet-hour buffer.'
        ]
      })
    }
  ];

  for (const prob of problemsData) {
    await prisma.problem.upsert({
      where: { slug: prob.slug },
      update: prob,
      create: prob
    });
  }
  console.log('5 interview problems successfully seeded.');

  // 3. Seed Realistic Historical Attempts for Parking Lot (Attempts 1, 2, 3)
  // Attempt 1: Monolithic ParkingLot with direct pricing (Health: 61)
  const parkingProb = await prisma.problem.findUnique({ where: { slug: 'parking-lot' } });
  if (parkingProb) {
    // Attempt 1 (Score: 61)
    const att1 = await prisma.attempt.upsert({
      where: {
        userId_problemId_attemptNumber: {
          userId: demoUser.id,
          problemId: parkingProb.id,
          attemptNumber: 1
        }
      },
      update: {},
      create: {
        id: 'att-parking-1',
        userId: demoUser.id,
        problemId: parkingProb.id,
        attemptNumber: 1,
        status: 'COMPLETED'
      }
    });

    const design1 = {
      assumptions: ['Single entry and exit gate', 'Flat rate pricing initially'],
      classes: [
        {
          name: 'ParkingLot',
          responsibility: 'Coordinates vehicle parking, calculates billing fee, processes cash payments, and stores all slot arrays.',
          attributes: [
            { name: 'slots', type: 'ParkingSpot[]', visibility: 'private' },
            { name: 'hourlyRate', type: 'number', visibility: 'public' },
            { name: 'collectedCash', type: 'number', visibility: 'public' }
          ],
          methods: [
            { name: 'parkVehicle', returnType: 'Ticket', parameters: [{ name: 'vehicle', type: 'Vehicle' }], visibility: 'public' },
            { name: 'calculateFee', returnType: 'number', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' },
            { name: 'processPayment', returnType: 'boolean', parameters: [{ name: 'amount', type: 'number' }], visibility: 'public' }
          ]
        },
        {
          name: 'ParkingSpot',
          responsibility: 'Represents a slot with a number and status.',
          attributes: [
            { name: 'slotNumber', type: 'number', visibility: 'private' },
            { name: 'isOccupied', type: 'boolean', visibility: 'public' }
          ],
          methods: [
            { name: 'occupy', returnType: 'void', parameters: [], visibility: 'public' },
            { name: 'vacate', returnType: 'void', parameters: [], visibility: 'public' }
          ]
        },
        {
          name: 'Vehicle',
          responsibility: 'Base vehicle class.',
          attributes: [
            { name: 'licensePlate', type: 'string', visibility: 'public' },
            { name: 'type', type: 'string', visibility: 'public' }
          ],
          methods: []
        },
        {
          name: 'Ticket',
          responsibility: 'Entry ticket record.',
          attributes: [
            { name: 'ticketId', type: 'string', visibility: 'public' },
            { name: 'entryTime', type: 'Date', visibility: 'public' }
          ],
          methods: []
        }
      ],
      interfaces: [],
      relationships: [
        { source: 'ParkingLot', target: 'ParkingSpot', type: 'COMPOSITION' },
        { source: 'ParkingLot', target: 'Ticket', type: 'DEPENDENCY' },
        { source: 'ParkingSpot', target: 'Vehicle', type: 'DEPENDENCY' }
      ],
      patterns: [],
      tradeoffs: ['Simpler to build in a single class, but difficult to add new pricing or payment methods.'],
      edgeCases: ['Full parking lot check']
    };

    await prisma.submission.upsert({
      where: { attemptId: att1.id },
      update: {},
      create: {
        id: 'sub-parking-1',
        attemptId: att1.id,
        assumptions: JSON.stringify(design1.assumptions),
        classes: JSON.stringify(design1.classes),
        interfaces: JSON.stringify(design1.interfaces),
        relationships: JSON.stringify(design1.relationships),
        patterns: JSON.stringify(design1.patterns),
        tradeoffs: JSON.stringify(design1.tradeoffs),
        edgeCases: JSON.stringify(design1.edgeCases),
        completenessScore: 70
      }
    });

    const eval1 = await prisma.evaluation.upsert({
      where: { attemptId: att1.id },
      update: {},
      create: {
        id: 'eval-parking-1',
        attemptId: att1.id,
        overallScore: 61,
        rating: 'NEEDS ATTENTION',
        seniorReviewSummary: 'Your design provides basic mechanics for parking vehicles, but exhibits severe architectural coupling. ParkingLot acts as a God Object: it owns slot storage, vehicle matching, pricing calculation, and payment processing. This breaches the Single Responsibility Principle and will cause high friction when requirement modifications are introduced.',
        topRecommendations: JSON.stringify([
          'Extract pricing calculations into an independent PricingStrategy abstraction.',
          'Extract payment processing into a PaymentService with support for credit cards.',
          'Decouple vehicle types using polymorphism instead of string classification.'
        ]),
        dimensionScores: JSON.stringify([
          { dimension: 'Requirement Understanding', score: 7.0, maxScore: 10 },
          { dimension: 'Responsibility Assignment', score: 5.0, maxScore: 10 },
          { dimension: 'Coupling', score: 5.5, maxScore: 10 },
          { dimension: 'Cohesion', score: 5.0, maxScore: 10 },
          { dimension: 'Encapsulation', score: 6.0, maxScore: 10 },
          { dimension: 'Interfaces', score: 4.5, maxScore: 10 },
          { dimension: 'Abstraction', score: 5.0, maxScore: 10 },
          { dimension: 'Pattern Fit', score: 5.0, maxScore: 10 },
          { dimension: 'Extensibility', score: 4.5, maxScore: 10 },
          { dimension: 'Edge Cases', score: 6.0, maxScore: 10 },
          { dimension: 'Testability', score: 5.0, maxScore: 10 },
          { dimension: 'Explanation Quality', score: 5.5, maxScore: 10 }
        ]),
        evaluatorType: 'DEMO'
      }
    });

    // Attempt 2 (Score: 74)
    const att2 = await prisma.attempt.upsert({
      where: {
        userId_problemId_attemptNumber: {
          userId: demoUser.id,
          problemId: parkingProb.id,
          attemptNumber: 2
        }
      },
      update: {},
      create: {
        id: 'att-parking-2',
        userId: demoUser.id,
        problemId: parkingProb.id,
        attemptNumber: 2,
        status: 'COMPLETED'
      }
    });

    const design2 = {
      assumptions: ['Multi-floor parking garage', 'Pluggable payment processors', 'Vehicle type hierarchy'],
      classes: [
        {
          name: 'ParkingLot',
          responsibility: 'Top-level garage coordinator managing floor levels and entry/exit gates.',
          attributes: [
            { name: 'floors', type: 'ParkingFloor[]', visibility: 'private' },
            { name: 'pricingStrategy', type: 'PricingStrategy', visibility: 'private' }
          ],
          methods: [
            { name: 'findAvailableSpot', returnType: 'ParkingSpot', parameters: [{ name: 'vehicle', type: 'Vehicle' }], visibility: 'public' },
            { name: 'checkout', returnType: 'ParkingReceipt', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' }
          ]
        },
        {
          name: 'ParkingFloor',
          responsibility: 'Tracks spot occupancy per floor and updates display board.',
          attributes: [
            { name: 'floorNumber', type: 'number', visibility: 'private' },
            { name: 'spots', type: 'ParkingSpot[]', visibility: 'private' }
          ],
          methods: [
            { name: 'getAvailableSpots', returnType: 'ParkingSpot[]', parameters: [{ name: 'type', type: 'VehicleType' }], visibility: 'public' }
          ]
        },
        {
          name: 'ParkingSpot',
          responsibility: 'Encapsulates spot dimensions and active vehicle reference.',
          attributes: [
            { name: 'spotId', type: 'string', visibility: 'private' },
            { name: 'isOccupied', type: 'boolean', visibility: 'private' }
          ],
          methods: [
            { name: 'assignVehicle', returnType: 'void', parameters: [{ name: 'v', type: 'Vehicle' }], visibility: 'public' },
            { name: 'releaseVehicle', returnType: 'void', parameters: [], visibility: 'public' }
          ]
        },
        {
          name: 'HourlyPricingStrategy',
          responsibility: 'Implements tiered hourly billing calculation.',
          attributes: [{ name: 'baseRate', type: 'number', visibility: 'private' }],
          methods: [
            { name: 'calculateFee', returnType: 'number', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' }
          ]
        }
      ],
      interfaces: [
        {
          name: 'PricingStrategy',
          methods: [
            { name: 'calculateFee', returnType: 'number', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' }
          ]
        },
        {
          name: 'PaymentProcessor',
          methods: [
            { name: 'processPayment', returnType: 'boolean', parameters: [{ name: 'amount', type: 'number' }], visibility: 'public' }
          ]
        }
      ],
      relationships: [
        { source: 'ParkingLot', target: 'ParkingFloor', type: 'COMPOSITION' },
        { source: 'ParkingFloor', target: 'ParkingSpot', type: 'COMPOSITION' },
        { source: 'ParkingLot', target: 'PricingStrategy', type: 'DEPENDENCY' },
        { source: 'HourlyPricingStrategy', target: 'PricingStrategy', type: 'IMPLEMENTATION' }
      ],
      patterns: [
        { name: 'Strategy Pattern', reason: 'Decouples pricing algorithm from parking lot manager', tradeoff: 'Introduces additional interface' }
      ],
      tradeoffs: ['Decoupled pricing at the cost of additional class contracts.'],
      edgeCases: ['Full lot handling', 'Spot assignment race condition']
    };

    await prisma.submission.upsert({
      where: { attemptId: att2.id },
      update: {},
      create: {
        id: 'sub-parking-2',
        attemptId: att2.id,
        assumptions: JSON.stringify(design2.assumptions),
        classes: JSON.stringify(design2.classes),
        interfaces: JSON.stringify(design2.interfaces),
        relationships: JSON.stringify(design2.relationships),
        patterns: JSON.stringify(design2.patterns),
        tradeoffs: JSON.stringify(design2.tradeoffs),
        edgeCases: JSON.stringify(design2.edgeCases),
        completenessScore: 85
      }
    });

    await prisma.evaluation.upsert({
      where: { attemptId: att2.id },
      update: {},
      create: {
        id: 'eval-parking-2',
        attemptId: att2.id,
        overallScore: 74,
        rating: 'GOOD',
        seniorReviewSummary: 'Substantial improvement over Attempt 1. Decomposing the garage into ParkingFloor levels and extracting the PricingStrategy interface cleanly addresses Single Responsibility. Coupling is significantly reduced. To achieve an L6 benchmark, introduce vehicle type polymorphism and address payment reconciliation.',
        topRecommendations: JSON.stringify([
          'Introduce dedicated VehicleType hierarchy (Motorcycle, Compact, SUV, Truck).',
          'Implement observer listeners for floor display boards.',
          'Define thread-safe spot locking to prevent race conditions during peak entry.'
        ]),
        dimensionScores: JSON.stringify([
          { dimension: 'Requirement Understanding', score: 8.0, maxScore: 10 },
          { dimension: 'Responsibility Assignment', score: 7.5, maxScore: 10 },
          { dimension: 'Coupling', score: 7.5, maxScore: 10 },
          { dimension: 'Cohesion', score: 7.5, maxScore: 10 },
          { dimension: 'Encapsulation', score: 8.0, maxScore: 10 },
          { dimension: 'Interfaces', score: 7.5, maxScore: 10 },
          { dimension: 'Abstraction', score: 7.0, maxScore: 10 },
          { dimension: 'Pattern Fit', score: 8.0, maxScore: 10 },
          { dimension: 'Extensibility', score: 7.5, maxScore: 10 },
          { dimension: 'Edge Cases', score: 7.0, maxScore: 10 },
          { dimension: 'Testability', score: 7.5, maxScore: 10 },
          { dimension: 'Explanation Quality', score: 7.5, maxScore: 10 }
        ]),
        evaluatorType: 'DEMO'
      }
    });

    // Attempt 3 (Score: 86)
    const att3 = await prisma.attempt.upsert({
      where: {
        userId_problemId_attemptNumber: {
          userId: demoUser.id,
          problemId: parkingProb.id,
          attemptNumber: 3
        }
      },
      update: {},
      create: {
        id: 'att-parking-3',
        userId: demoUser.id,
        problemId: parkingProb.id,
        attemptNumber: 3,
        status: 'COMPLETED'
      }
    });

    const design3 = {
      assumptions: ['Multi-floor facility with automated display boards', 'Pluggable pricing strategies with surge multipliers', 'Thread-safe spot assignment'],
      classes: [
        {
          name: 'ParkingLot',
          responsibility: 'Singleton entrance coordinator orchestrating floor managers and gate terminals.',
          attributes: [
            { name: 'floors', type: 'ParkingFloor[]', visibility: 'private' },
            { name: 'pricingStrategy', type: 'PricingStrategy', visibility: 'private' },
            { name: 'paymentProcessor', type: 'PaymentProcessor', visibility: 'private' }
          ],
          methods: [
            { name: 'assignSpot', returnType: 'ParkingSpot', parameters: [{ name: 'vehicle', type: 'Vehicle' }], visibility: 'public' },
            { name: 'processExit', returnType: 'ParkingReceipt', parameters: [{ name: 'ticket', type: 'Ticket' }, { name: 'payment', type: 'PaymentDetails' }], visibility: 'public' }
          ]
        },
        {
          name: 'ParkingFloor',
          responsibility: 'Manages floor spot collection, spot allocation by vehicle size, and publishes vacancy events.',
          attributes: [
            { name: 'floorId', type: 'number', visibility: 'private' },
            { name: 'spotMap', type: 'Map<SpotType, ParkingSpot[]>', visibility: 'private' },
            { name: 'displayBoard', type: 'DisplayBoard', visibility: 'private' }
          ],
          methods: [
            { name: 'allocateSpot', returnType: 'ParkingSpot', parameters: [{ name: 'type', type: 'VehicleType' }], visibility: 'public' },
            { name: 'notifySpotFreed', returnType: 'void', parameters: [{ name: 'spot', type: 'ParkingSpot' }], visibility: 'public' }
          ]
        },
        {
          name: 'ParkingSpot',
          responsibility: 'Encapsulates lockable spot status and dimension constraints.',
          attributes: [
            { name: 'spotId', type: 'string', visibility: 'private' },
            { name: 'spotType', type: 'SpotType', visibility: 'private' },
            { name: 'isAvailable', type: 'boolean', visibility: 'private' }
          ],
          methods: [
            { name: 'tryOccupy', returnType: 'boolean', parameters: [{ name: 'vehicle', type: 'Vehicle' }], visibility: 'public' },
            { name: 'release', returnType: 'void', parameters: [], visibility: 'public' }
          ]
        },
        {
          name: 'Vehicle',
          responsibility: 'Abstract base entity representing vehicle properties.',
          attributes: [
            { name: 'licenseNumber', type: 'string', visibility: 'protected' },
            { name: 'vehicleType', type: 'VehicleType', visibility: 'protected' }
          ],
          methods: [
            { name: 'getType', returnType: 'VehicleType', parameters: [], visibility: 'public' }
          ]
        },
        {
          name: 'HourlyTieredPricing',
          responsibility: 'Computes billable fee based on hourly brackets and vehicle category.',
          attributes: [{ name: 'bracketRates', type: 'Map<number, number>', visibility: 'private' }],
          methods: [
            { name: 'calculateFee', returnType: 'number', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' }
          ]
        },
        {
          name: 'DisplayBoard',
          responsibility: 'Observer showing real-time available spots per vehicle category.',
          attributes: [{ name: 'availableCounts', type: 'Map<SpotType, number>', visibility: 'private' }],
          methods: [
            { name: 'updateCounts', returnType: 'void', parameters: [{ name: 'type', type: 'SpotType' }, { name: 'count', type: 'number' }], visibility: 'public' }
          ]
        }
      ],
      interfaces: [
        {
          name: 'PricingStrategy',
          methods: [
            { name: 'calculateFee', returnType: 'number', parameters: [{ name: 'ticket', type: 'Ticket' }], visibility: 'public' }
          ]
        },
        {
          name: 'PaymentProcessor',
          methods: [
            { name: 'charge', returnType: 'TransactionStatus', parameters: [{ name: 'amount', type: 'number' }, { name: 'details', type: 'PaymentDetails' }], visibility: 'public' }
          ]
        },
        {
          name: 'VacancyListener',
          methods: [
            { name: 'onSpotStatusChanged', returnType: 'void', parameters: [{ name: 'floor', type: 'number' }, { name: 'type', type: 'SpotType' }], visibility: 'public' }
          ]
        }
      ],
      relationships: [
        { source: 'ParkingLot', target: 'ParkingFloor', type: 'COMPOSITION' },
        { source: 'ParkingFloor', target: 'ParkingSpot', type: 'COMPOSITION' },
        { source: 'ParkingLot', target: 'PricingStrategy', type: 'DEPENDENCY' },
        { source: 'ParkingLot', target: 'PaymentProcessor', type: 'DEPENDENCY' },
        { source: 'HourlyTieredPricing', target: 'PricingStrategy', type: 'IMPLEMENTATION' },
        { source: 'ParkingFloor', target: 'DisplayBoard', type: 'DEPENDENCY' }
      ],
      patterns: [
        { name: 'Strategy Pattern', reason: 'Allows runtime swapping of pricing logic (e.g. flat rate vs hourly tiered vs surge)', tradeoff: 'Adds interface and concrete strategy classes' },
        { name: 'Observer Pattern', reason: 'Updates display boards in real-time without tight floor coupling', tradeoff: 'Event notification overhead' },
        { name: 'Factory Pattern', reason: 'Instantiates appropriate spot allocations based on vehicle size', tradeoff: 'Slightly higher initial boilerplate' }
      ],
      tradeoffs: [
        'Decoupled pricing and payment logic via interfaces to ensure open-closed extensibility.',
        'Employed synchronized tryOccupy on ParkingSpot to prevent double-booking under concurrent load.'
      ],
      edgeCases: [
        'Concurrent entries race condition for final spot on floor.',
        'Lost ticket penalty rule.',
        'Payment processor failure fallback to manual cashier ticket.'
      ]
    };

    await prisma.submission.upsert({
      where: { attemptId: att3.id },
      update: {},
      create: {
        id: 'sub-parking-3',
        attemptId: att3.id,
        assumptions: JSON.stringify(design3.assumptions),
        classes: JSON.stringify(design3.classes),
        interfaces: JSON.stringify(design3.interfaces),
        relationships: JSON.stringify(design3.relationships),
        patterns: JSON.stringify(design3.patterns),
        tradeoffs: JSON.stringify(design3.tradeoffs),
        edgeCases: JSON.stringify(design3.edgeCases),
        completenessScore: 95
      }
    });

    await prisma.evaluation.upsert({
      where: { attemptId: att3.id },
      update: {},
      create: {
        id: 'eval-parking-3',
        attemptId: att3.id,
        overallScore: 86,
        rating: 'STRONG',
        seniorReviewSummary: 'Outstanding architectural evolution. The design exhibits high cohesion and loose coupling. Extracting PricingStrategy and PaymentProcessor interfaces protects core logic from downstream vendor changes. The Observer pattern on DisplayBoard delivers clean decoupled telemetry. Your design demonstrates senior-level L5/L6 Low-Level Design competency.',
        topRecommendations: JSON.stringify([
          'Consider introducing a distributed reservation token for multi-gate synchronization across clusters.',
          'Clarify exception fallback policies for offline credit card settlement.',
          'Refine spot sizing logic to support custom vehicle overhang constraints.'
        ]),
        dimensionScores: JSON.stringify([
          { dimension: 'Requirement Understanding', score: 9.0, maxScore: 10 },
          { dimension: 'Responsibility Assignment', score: 9.0, maxScore: 10 },
          { dimension: 'Coupling', score: 8.5, maxScore: 10 },
          { dimension: 'Cohesion', score: 9.0, maxScore: 10 },
          { dimension: 'Encapsulation', score: 8.5, maxScore: 10 },
          { dimension: 'Interfaces', score: 8.5, maxScore: 10 },
          { dimension: 'Abstraction', score: 8.5, maxScore: 10 },
          { dimension: 'Pattern Fit', score: 9.0, maxScore: 10 },
          { dimension: 'Extensibility', score: 8.5, maxScore: 10 },
          { dimension: 'Edge Cases', score: 8.0, maxScore: 10 },
          { dimension: 'Testability', score: 8.5, maxScore: 10 },
          { dimension: 'Explanation Quality', score: 8.5, maxScore: 10 }
        ]),
        evaluatorType: 'DEMO'
      }
    });
  }

  // 4. Seed Elevator System (Attempts 1 and 2)
  const elevatorProb = await prisma.problem.findUnique({ where: { slug: 'elevator-system' } });
  if (elevatorProb) {
    // Attempt 1 (Score: 72)
    const elAtt1 = await prisma.attempt.upsert({
      where: {
        userId_problemId_attemptNumber: {
          userId: demoUser.id,
          problemId: elevatorProb.id,
          attemptNumber: 1
        }
      },
      update: {},
      create: {
        id: 'att-elevator-1',
        userId: demoUser.id,
        problemId: elevatorProb.id,
        attemptNumber: 1,
        status: 'COMPLETED'
      }
    });

    const elDesign1 = {
      assumptions: ['40 floors, 6 cars', 'Standard hall calls'],
      classes: [
        {
          name: 'ElevatorSystem',
          responsibility: 'Coordinates hall calls and polls car states.',
          attributes: [
            { name: 'cars', type: 'ElevatorCar[]', visibility: 'private' },
            { name: 'floors', type: 'number', visibility: 'public' }
          ],
          methods: [
            { name: 'requestElevator', returnType: 'void', parameters: [{ name: 'floor', type: 'number' }, { name: 'direction', type: 'string' }], visibility: 'public' }
          ]
        },
        {
          name: 'ElevatorCar',
          responsibility: 'Represents car state and movement.',
          attributes: [
            { name: 'currentFloor', type: 'number', visibility: 'private' },
            { name: 'direction', type: 'string', visibility: 'private' },
            { name: 'isMoving', type: 'boolean', visibility: 'private' }
          ],
          methods: [
            { name: 'moveToFloor', returnType: 'void', parameters: [{ name: 'floor', type: 'number' }], visibility: 'public' }
          ]
        }
      ],
      interfaces: [],
      relationships: [
        { source: 'ElevatorSystem', target: 'ElevatorCar', type: 'COMPOSITION' }
      ],
      patterns: [],
      tradeoffs: ['Simple polling loop'],
      edgeCases: ['Simultaneous requests']
    };

    await prisma.submission.upsert({
      where: { attemptId: elAtt1.id },
      update: {},
      create: {
        id: 'sub-elevator-1',
        attemptId: elAtt1.id,
        assumptions: JSON.stringify(elDesign1.assumptions),
        classes: JSON.stringify(elDesign1.classes),
        interfaces: JSON.stringify(elDesign1.interfaces),
        relationships: JSON.stringify(elDesign1.relationships),
        patterns: JSON.stringify(elDesign1.patterns),
        tradeoffs: JSON.stringify(elDesign1.tradeoffs),
        edgeCases: JSON.stringify(elDesign1.edgeCases),
        completenessScore: 75
      }
    });

    await prisma.evaluation.upsert({
      where: { attemptId: elAtt1.id },
      update: {},
      create: {
        id: 'eval-elevator-1',
        attemptId: elAtt1.id,
        overallScore: 72,
        rating: 'GOOD',
        seniorReviewSummary: 'Good foundational representation of elevator mechanics. However, elevator state is modeled procedurally with raw boolean flags (isMoving, direction string). This risks illegal transitions (such as doors opening while moving). Furthermore, the dispatching strategy is tightly coupled inside ElevatorSystem.',
        topRecommendations: JSON.stringify([
          'Use the State Pattern to model ElevatorState (MovingState, IdleState, StoppedState).',
          'Extract DispatchStrategy interface to isolate scheduling algorithms (SCAN, LOOK).',
          'Add door sensor telemetry and overload weight capacity guards.'
        ]),
        dimensionScores: JSON.stringify([
          { dimension: 'Requirement Understanding', score: 8.0, maxScore: 10 },
          { dimension: 'Responsibility Assignment', score: 7.0, maxScore: 10 },
          { dimension: 'Coupling', score: 7.0, maxScore: 10 },
          { dimension: 'Cohesion', score: 7.0, maxScore: 10 },
          { dimension: 'Encapsulation', score: 7.5, maxScore: 10 },
          { dimension: 'Interfaces', score: 6.5, maxScore: 10 },
          { dimension: 'Abstraction', score: 7.0, maxScore: 10 },
          { dimension: 'Pattern Fit', score: 7.0, maxScore: 10 },
          { dimension: 'Extensibility', score: 7.0, maxScore: 10 },
          { dimension: 'Edge Cases', score: 7.0, maxScore: 10 },
          { dimension: 'Testability', score: 7.0, maxScore: 10 },
          { dimension: 'Explanation Quality', score: 7.5, maxScore: 10 }
        ]),
        evaluatorType: 'DEMO'
      }
    });

    // Attempt 2 (Score: 81)
    const elAtt2 = await prisma.attempt.upsert({
      where: {
        userId_problemId_attemptNumber: {
          userId: demoUser.id,
          problemId: elevatorProb.id,
          attemptNumber: 2
        }
      },
      update: {},
      create: {
        id: 'att-elevator-2',
        userId: demoUser.id,
        problemId: elevatorProb.id,
        attemptNumber: 2,
        status: 'COMPLETED'
      }
    });

    const elDesign2 = {
      assumptions: ['40 floors, 6 elevator cars', 'Look/Scan dispatch algorithm', 'State pattern for car lifecycle'],
      classes: [
        {
          name: 'ElevatorController',
          responsibility: 'Receives hall requests and dispatches optimal car using DispatchStrategy.',
          attributes: [
            { name: 'cars', type: 'ElevatorCar[]', visibility: 'private' },
            { name: 'dispatcher', type: 'DispatchStrategy', visibility: 'private' }
          ],
          methods: [
            { name: 'onHallCall', returnType: 'void', parameters: [{ name: 'floor', type: 'number' }, { name: 'dir', type: 'Direction' }], visibility: 'public' }
          ]
        },
        {
          name: 'ElevatorCar',
          responsibility: 'Manages physical elevator motion and delegates actions to current ElevatorState.',
          attributes: [
            { name: 'carId', type: 'number', visibility: 'private' },
            { name: 'currentFloor', type: 'number', visibility: 'private' },
            { name: 'state', type: 'ElevatorState', visibility: 'private' }
          ],
          methods: [
            { name: 'changeState', returnType: 'void', parameters: [{ name: 'newState', type: 'ElevatorState' }], visibility: 'public' },
            { name: 'step', returnType: 'void', parameters: [], visibility: 'public' }
          ]
        },
        {
          name: 'LookDispatchStrategy',
          responsibility: 'Implements elevator LOOK optimization algorithm.',
          attributes: [],
          methods: [
            { name: 'selectCar', returnType: 'ElevatorCar', parameters: [{ name: 'cars', type: 'ElevatorCar[]' }, { name: 'request', type: 'HallRequest' }], visibility: 'public' }
          ]
        }
      ],
      interfaces: [
        {
          name: 'DispatchStrategy',
          methods: [
            { name: 'selectCar', returnType: 'ElevatorCar', parameters: [{ name: 'cars', type: 'ElevatorCar[]' }, { name: 'request', type: 'HallRequest' }], visibility: 'public' }
          ]
        },
        {
          name: 'ElevatorState',
          methods: [
            { name: 'handleMotion', returnType: 'void', parameters: [{ name: 'car', type: 'ElevatorCar' }], visibility: 'public' },
            { name: 'openDoors', returnType: 'void', parameters: [{ name: 'car', type: 'ElevatorCar' }], visibility: 'public' }
          ]
        }
      ],
      relationships: [
        { source: 'ElevatorController', target: 'ElevatorCar', type: 'COMPOSITION' },
        { source: 'ElevatorController', target: 'DispatchStrategy', type: 'DEPENDENCY' },
        { source: 'LookDispatchStrategy', target: 'DispatchStrategy', type: 'IMPLEMENTATION' },
        { source: 'ElevatorCar', target: 'ElevatorState', type: 'DEPENDENCY' }
      ],
      patterns: [
        { name: 'State Pattern', reason: 'Eliminates invalid state transitions like opening doors mid-transit', tradeoff: 'More state class files' },
        { name: 'Strategy Pattern', reason: 'Allows swapping elevator scheduling algorithms', tradeoff: 'Indirection in controller' }
      ],
      tradeoffs: ['State pattern ensures legal transitions at the cost of class count.'],
      edgeCases: ['Emergency stop mid-floor', 'Door sensor blockage']
    };

    await prisma.submission.upsert({
      where: { attemptId: elAtt2.id },
      update: {},
      create: {
        id: 'sub-elevator-2',
        attemptId: elAtt2.id,
        assumptions: JSON.stringify(elDesign2.assumptions),
        classes: JSON.stringify(elDesign2.classes),
        interfaces: JSON.stringify(elDesign2.interfaces),
        relationships: JSON.stringify(elDesign2.relationships),
        patterns: JSON.stringify(elDesign2.patterns),
        tradeoffs: JSON.stringify(elDesign2.tradeoffs),
        edgeCases: JSON.stringify(elDesign2.edgeCases),
        completenessScore: 90
      }
    });

    await prisma.evaluation.upsert({
      where: { attemptId: elAtt2.id },
      update: {},
      create: {
        id: 'eval-elevator-2',
        attemptId: elAtt2.id,
        overallScore: 81,
        rating: 'GOOD',
        seniorReviewSummary: 'Clear improvement with the introduction of the State Pattern for elevator lifecycle and the Strategy Pattern for dispatching. Responsibilities are cleanly demarcated. The remaining gap is the lack of explicit observer telemetry for hall displays and emergency override handling.',
        topRecommendations: JSON.stringify([
          'Add Observer interfaces for floor display indicators.',
          'Define fire alarm emergency preemption semantics.',
          'Add internal weight sensor telemetry.'
        ]),
        dimensionScores: JSON.stringify([
          { dimension: 'Requirement Understanding', score: 8.5, maxScore: 10 },
          { dimension: 'Responsibility Assignment', score: 8.5, maxScore: 10 },
          { dimension: 'Coupling', score: 8.0, maxScore: 10 },
          { dimension: 'Cohesion', score: 8.0, maxScore: 10 },
          { dimension: 'Encapsulation', score: 8.5, maxScore: 10 },
          { dimension: 'Interfaces', score: 8.0, maxScore: 10 },
          { dimension: 'Abstraction', score: 8.0, maxScore: 10 },
          { dimension: 'Pattern Fit', score: 8.5, maxScore: 10 },
          { dimension: 'Extensibility', score: 8.0, maxScore: 10 },
          { dimension: 'Edge Cases', score: 7.5, maxScore: 10 },
          { dimension: 'Testability', score: 8.0, maxScore: 10 },
          { dimension: 'Explanation Quality', score: 8.0, maxScore: 10 }
        ]),
        evaluatorType: 'DEMO'
      }
    });
  }

  // 5. Seed initial Security Events
  await prisma.securityEvent.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'SECURITY_BOOTSTRAP',
        status: 'PROTECTED',
        details: 'Security middleware baseline initialized: Helmet, RateLimiting, Zod Validation, Strict CORS'
      },
      {
        userId: demoUser.id,
        type: 'SECRET_SCAN',
        status: 'PROTECTED',
        details: 'Scanned environment. Zero API keys or secrets detected in frontend bundles or Git tracked files.'
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
