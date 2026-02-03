import Foundation
import Alamofire

class APIService {
    static let shared = APIService()
    
    private let baseURL = "https://api.bookdigest.com/api"
    private var authToken: String? {
        KeychainManager.shared.getToken()
    }
    
    private init() {}
    
    // MARK: - Authentication
    
    func register(email: String, password: String, firstName: String?, lastName: String?) async throws -> AuthResponse {
        let parameters: [String: Any] = [
            "email": email,
            "password": password,
            "firstName": firstName ?? "",
            "lastName": lastName ?? ""
        ]
        
        return try await request(
            endpoint: "/auth/register",
            method: .post,
            parameters: parameters
        )
    }
    
    func login(email: String, password: String) async throws -> AuthResponse {
        let parameters: [String: Any] = [
            "email": email,
            "password": password
        ]
        
        return try await request(
            endpoint: "/auth/login",
            method: .post,
            parameters: parameters
        )
    }
    
    func getProfile() async throws -> UserResponse {
        return try await request(endpoint: "/auth/profile", method: .get)
    }
    
    // MARK: - Books
    
    func getBooks(page: Int = 1, category: String? = nil, isPremium: Bool? = nil) async throws -> BooksResponse {
        var parameters: [String: Any] = ["page": page, "limit": 20]
        if let category = category { parameters["category"] = category }
        if let isPremium = isPremium { parameters["isPremium"] = isPremium }
        
        return try await request(
            endpoint: "/books",
            method: .get,
            parameters: parameters
        )
    }
    
    func getBookById(_ id: String) async throws -> BookDetailResponse {
        return try await request(endpoint: "/books/\(id)", method: .get)
    }
    
    func getFeaturedBooks() async throws -> BooksResponse {
        return try await request(endpoint: "/books/featured", method: .get)
    }
    
    func searchBooks(query: String, page: Int = 1) async throws -> BooksResponse {
        let parameters: [String: Any] = ["q": query, "page": page]
        return try await request(
            endpoint: "/books/search",
            method: .get,
            parameters: parameters
        )
    }
    
    func toggleFavorite(bookId: String) async throws -> FavoriteResponse {
        return try await request(endpoint: "/books/\(bookId)/favorite", method: .post)
    }
    
    func getFavorites() async throws -> BooksResponse {
        return try await request(endpoint: "/books/favorites/me", method: .get)
    }
    
    // MARK: - Progress
    
    func updateProgress(bookId: String, progress: ProgressRequest) async throws -> ProgressResponse {
        return try await request(
            endpoint: "/books/\(bookId)/progress",
            method: .post,
            parameters: progress.toDictionary()
        )
    }
    
    func getProgress(bookId: String) async throws -> ProgressResponse {
        return try await request(endpoint: "/books/\(bookId)/progress", method: .get)
    }
    
    // MARK: - Reviews
    
    func addReview(bookId: String, rating: Int, comment: String?) async throws -> ReviewResponse {
        let parameters: [String: Any] = [
            "rating": rating,
            "comment": comment ?? ""
        ]
        
        return try await request(
            endpoint: "/books/\(bookId)/reviews",
            method: .post,
            parameters: parameters
        )
    }
    
    // MARK: - Categories
    
    func getCategories() async throws -> CategoriesResponse {
        return try await request(endpoint: "/categories", method: .get)
    }
    
    // MARK: - User Stats
    
    func getUserStats() async throws -> UserStatsResponse {
        return try await request(endpoint: "/users/stats", method: .get)
    }
    
    // MARK: - Payments
    
    func createCheckoutSession(planType: String) async throws -> CheckoutResponse {
        let parameters: [String: Any] = ["planType": planType]
        return try await request(
            endpoint: "/payments/create-checkout-session",
            method: .post,
            parameters: parameters
        )
    }
    
    func getSubscriptionStatus() async throws -> SubscriptionResponse {
        return try await request(endpoint: "/payments/subscription-status", method: .get)
    }
    
    // MARK: - Generic Request Method
    
    private func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod,
        parameters: [String: Any]? = nil
    ) async throws -> T {
        let url = baseURL + endpoint
        
        var headers: HTTPHeaders = [
            "Content-Type": "application/json",
            "Accept": "application/json"
        ]
        
        if let token = authToken {
            headers["Authorization"] = "Bearer \(token)"
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            AF.request(
                url,
                method: method,
                parameters: parameters,
                encoding: method == .get ? URLEncoding.default : JSONEncoding.default,
                headers: headers
            )
            .validate()
            .responseDecodable(of: T.self) { response in
                switch response.result {
                case .success(let value):
                    continuation.resume(returning: value)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }
    }
}
