import Foundation

// MARK: - Auth Models

struct AuthResponse: Codable {
    let status: String
    let data: AuthData
}

struct AuthData: Codable {
    let user: User
    let token: String
}

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String?
    let lastName: String?
    let avatar: String?
    let role: String
    let subscriptionType: String
    let booksRead: Int
    let totalReadingTime: Int
    let currentStreak: Int
    
    var displayName: String {
        if let firstName = firstName, let lastName = lastName {
            return "\(firstName) \(lastName)"
        }
        return email
    }
}

struct UserResponse: Codable {
    let status: String
    let data: UserData
}

struct UserData: Codable {
    let user: User
}

// MARK: - Book Models

struct Book: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let author: String
    let coverImage: String
    let summary: String
    let keyInsights: [String]
    let quotes: [String]
    let readingTime: Int
    let audioUrl: String?
    let audioDuration: Int?
    let rating: Float
    let ratingsCount: Int
    let isPremium: Bool
    let isFeatured: Bool
    let category: Category
    let tags: [String]
    let amazonLink: String?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Book, rhs: Book) -> Bool {
        lhs.id == rhs.id
    }
}

struct Category: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let slug: String
    let color: String?
    let icon: String?
}

struct BooksResponse: Codable {
    let status: String
    let data: BooksData
}

struct BooksData: Codable {
    let books: [Book]
    let pagination: Pagination?
}

struct BookDetailResponse: Codable {
    let status: String
    let data: BookDetailData
}

struct BookDetailData: Codable {
    let book: Book
    let requiresPremium: Bool?
}

struct Pagination: Codable {
    let total: Int
    let page: Int
    let pages: Int
}

// MARK: - Category Models

struct CategoriesResponse: Codable {
    let status: String
    let data: CategoriesData
}

struct CategoriesData: Codable {
    let categories: [Category]
}

// MARK: - Favorite Models

struct FavoriteResponse: Codable {
    let status: String
    let data: FavoriteData
}

struct FavoriteData: Codable {
    let isFavorite: Bool
}

// MARK: - Progress Models

struct ProgressRequest: Codable {
    let progress: Float
    let currentChapter: Int
    let audioProgress: Int
    let timeSpent: Int
    let isCompleted: Bool
    
    func toDictionary() -> [String: Any] {
        return [
            "progress": progress,
            "currentChapter": currentChapter,
            "audioProgress": audioProgress,
            "timeSpent": timeSpent,
            "isCompleted": isCompleted
        ]
    }
}

struct ProgressResponse: Codable {
    let status: String
    let data: ProgressData
}

struct ProgressData: Codable {
    let progress: ReadingProgress?
}

struct ReadingProgress: Codable {
    let id: String
    let progress: Float
    let currentChapter: Int
    let audioProgress: Int
    let timeSpent: Int
    let isCompleted: Bool
}

// MARK: - Review Models

struct ReviewResponse: Codable {
    let status: String
    let data: ReviewData
}

struct ReviewData: Codable {
    let review: Review
}

struct Review: Codable, Identifiable {
    let id: String
    let rating: Int
    let comment: String?
    let user: UserBasic
    let createdAt: String
}

struct UserBasic: Codable {
    let firstName: String?
    let lastName: String?
    let avatar: String?
}

// MARK: - Stats Models

struct UserStatsResponse: Codable {
    let status: String
    let data: StatsData
}

struct StatsData: Codable {
    let stats: UserStats
}

struct UserStats: Codable {
    let booksRead: Int
    let totalReadingTime: Int
    let currentStreak: Int
    let longestStreak: Int
    let inProgress: Int
    let favorites: Int
    let achievements: Int
    let subscriptionType: String
}

// MARK: - Payment Models

struct CheckoutResponse: Codable {
    let status: String
    let data: CheckoutData
}

struct CheckoutData: Codable {
    let sessionId: String
    let url: String
}

struct SubscriptionResponse: Codable {
    let status: String
    let data: SubscriptionData
}

struct SubscriptionData: Codable {
    let subscriptionType: String
    let subscriptionEnd: String?
    let details: SubscriptionDetails?
}

struct SubscriptionDetails: Codable {
    let status: String
    let currentPeriodEnd: String
    let cancelAtPeriodEnd: Bool
}
