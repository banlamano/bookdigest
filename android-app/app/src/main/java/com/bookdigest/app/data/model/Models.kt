package com.bookdigest.app.data.model

import com.google.gson.annotations.SerializedName

// Auth Models
data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String? = null,
    val lastName: String? = null
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val status: String,
    val data: AuthData
)

data class AuthData(
    val user: User,
    val token: String
)

data class User(
    val id: String,
    val email: String,
    val firstName: String?,
    val lastName: String?,
    val avatar: String?,
    val role: String,
    val subscriptionType: String,
    val booksRead: Int = 0,
    val totalReadingTime: Int = 0,
    val currentStreak: Int = 0
)

data class UserResponse(
    val status: String,
    val data: UserData
)

data class UserData(
    val user: User
)

// Book Models
data class Book(
    val id: String,
    val title: String,
    val author: String,
    val coverImage: String,
    val summary: String,
    val keyInsights: List<String>,
    val quotes: List<String>,
    val readingTime: Int,
    val audioUrl: String?,
    val audioDuration: Int?,
    val rating: Float,
    val ratingsCount: Int,
    val isPremium: Boolean,
    val isFeatured: Boolean,
    val category: Category,
    val tags: List<String>,
    val amazonLink: String?,
    val chapters: List<Chapter>? = null
)

data class Category(
    val id: String,
    val name: String,
    val slug: String,
    val color: String?,
    val icon: String?
)

data class Chapter(
    val title: String,
    val content: String
)

data class BooksResponse(
    val status: String,
    val data: BooksData
)

data class BooksData(
    val books: List<Book>,
    val pagination: Pagination? = null
)

data class BookDetailResponse(
    val status: String,
    val data: BookDetailData
)

data class BookDetailData(
    val book: Book,
    val requiresPremium: Boolean = false
)

data class Pagination(
    val total: Int,
    val page: Int,
    val pages: Int
)

// Category Models
data class CategoriesResponse(
    val status: String,
    val data: CategoriesData
)

data class CategoriesData(
    val categories: List<Category>
)

// Favorite Models
data class FavoriteResponse(
    val status: String,
    val data: FavoriteData
)

data class FavoriteData(
    val isFavorite: Boolean
)

// Progress Models
data class ProgressRequest(
    val progress: Float,
    val currentChapter: Int,
    val audioProgress: Int,
    val timeSpent: Int,
    val isCompleted: Boolean
)

data class ProgressResponse(
    val status: String,
    val data: ProgressData
)

data class ProgressData(
    val progress: ReadingProgress?
)

data class ReadingProgress(
    val id: String,
    val progress: Float,
    val currentChapter: Int,
    val audioProgress: Int,
    val timeSpent: Int,
    val isCompleted: Boolean
)

// Review Models
data class ReviewRequest(
    val rating: Int,
    val comment: String?
)

data class ReviewResponse(
    val status: String,
    val data: ReviewData
)

data class ReviewData(
    val review: Review
)

data class Review(
    val id: String,
    val rating: Int,
    val comment: String?,
    val user: UserBasic,
    val createdAt: String
)

data class UserBasic(
    val firstName: String?,
    val lastName: String?,
    val avatar: String?
)

data class ReviewsResponse(
    val status: String,
    val data: ReviewsData
)

data class ReviewsData(
    val reviews: List<Review>,
    val pagination: Pagination
)

// Stats Models
data class UserStatsResponse(
    val status: String,
    val data: StatsData
)

data class StatsData(
    val stats: UserStats
)

data class UserStats(
    val booksRead: Int,
    val totalReadingTime: Int,
    val currentStreak: Int,
    val longestStreak: Int,
    val inProgress: Int,
    val favorites: Int,
    val achievements: Int,
    val subscriptionType: String
)

// History Models
data class HistoryResponse(
    val status: String,
    val data: HistoryData
)

data class HistoryData(
    val history: List<HistoryItem>,
    val pagination: Pagination
)

data class HistoryItem(
    val id: String,
    val book: Book,
    val duration: Int,
    val completed: Boolean,
    val createdAt: String
)

// Payment Models
data class CheckoutRequest(
    val planType: String // "monthly", "yearly", "team"
)

data class CheckoutResponse(
    val status: String,
    val data: CheckoutData
)

data class CheckoutData(
    val sessionId: String,
    val url: String
)

data class SubscriptionResponse(
    val status: String,
    val data: SubscriptionData
)

data class SubscriptionData(
    val subscriptionType: String,
    val subscriptionEnd: String?,
    val details: SubscriptionDetails?
)

data class SubscriptionDetails(
    val status: String,
    val currentPeriodEnd: String,
    val cancelAtPeriodEnd: Boolean
)
