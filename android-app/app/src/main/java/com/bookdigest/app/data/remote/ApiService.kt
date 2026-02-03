package com.bookdigest.app.data.remote

import com.bookdigest.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @GET("auth/profile")
    suspend fun getProfile(): Response<UserResponse>
    
    // Books
    @GET("books")
    suspend fun getBooks(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("category") category: String? = null,
        @Query("isPremium") isPremium: Boolean? = null
    ): Response<BooksResponse>
    
    @GET("books/{id}")
    suspend fun getBookById(@Path("id") bookId: String): Response<BookDetailResponse>
    
    @GET("books/featured")
    suspend fun getFeaturedBooks(): Response<BooksResponse>
    
    @GET("books/search")
    suspend fun searchBooks(
        @Query("q") query: String,
        @Query("page") page: Int = 1
    ): Response<BooksResponse>
    
    // Favorites
    @POST("books/{id}/favorite")
    suspend fun toggleFavorite(@Path("id") bookId: String): Response<FavoriteResponse>
    
    @GET("books/favorites/me")
    suspend fun getFavorites(): Response<BooksResponse>
    
    // Progress
    @POST("books/{id}/progress")
    suspend fun updateProgress(
        @Path("id") bookId: String,
        @Body progress: ProgressRequest
    ): Response<ProgressResponse>
    
    @GET("books/{id}/progress")
    suspend fun getProgress(@Path("id") bookId: String): Response<ProgressResponse>
    
    // Reviews
    @POST("books/{id}/reviews")
    suspend fun addReview(
        @Path("id") bookId: String,
        @Body review: ReviewRequest
    ): Response<ReviewResponse>
    
    @GET("books/{id}/reviews")
    suspend fun getReviews(
        @Path("id") bookId: String,
        @Query("page") page: Int = 1
    ): Response<ReviewsResponse>
    
    // Categories
    @GET("categories")
    suspend fun getCategories(): Response<CategoriesResponse>
    
    @GET("categories/{slug}/books")
    suspend fun getCategoryBooks(
        @Path("slug") slug: String,
        @Query("page") page: Int = 1
    ): Response<BooksResponse>
    
    // User Stats
    @GET("users/stats")
    suspend fun getUserStats(): Response<UserStatsResponse>
    
    @GET("users/history")
    suspend fun getReadingHistory(@Query("page") page: Int = 1): Response<HistoryResponse>
    
    // Payments
    @POST("payments/create-checkout-session")
    suspend fun createCheckoutSession(@Body request: CheckoutRequest): Response<CheckoutResponse>
    
    @GET("payments/subscription-status")
    suspend fun getSubscriptionStatus(): Response<SubscriptionResponse>
}
