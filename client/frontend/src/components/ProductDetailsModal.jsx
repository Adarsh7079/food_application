import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { ShopContext } from "../context/ShopContextContext";
import { apiClient, getApiErrorMessage } from "../lib/apiClient";

const ProductDetailsModal = ({ product, currency = "₹", onClose, onAdd }) => {
  const { submitProductReview } = useContext(ShopContext);
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const isCustomer = Boolean(token && currentUser?.roles?.includes("CUSTOMER"));
  const productId = product?._id;
  const productRating = product?.rating;
  const productRatingCount = product?.ratingCount;
  const hasDatabaseProduct = /^[a-f\d]{24}$/i.test(product?._id || "");

  useEffect(() => {
    if (!product) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  useEffect(() => {
    setReviews([]);
    setRatingSummary(null);
    setMyReview(null);
    setRating(0);
    setComment("");
    setReviewsLoading(false);
    setReviewError("");
    setReviewMessage("");
    if (!productId || !hasDatabaseProduct) return undefined;

    let isCurrent = true;
    setReviewsLoading(true);
    const requests = [
      apiClient.get(`/api/v1/products/${productId}/reviews`),
    ];
    if (token && isCustomer) {
      requests.push(apiClient.get(`/api/v1/products/${productId}/reviews/me`));
    }

    Promise.allSettled(requests)
      .then(([reviewsResult, myReviewResult]) => {
        if (!isCurrent) return;
        if (reviewsResult.status === "rejected") throw reviewsResult.reason;
        const reviewData = reviewsResult.value.data.data;
        setReviews(reviewData.reviews || []);
        setRatingSummary({
          rating: productRating,
          ratingCount: productRatingCount || 0,
        });
        if (myReviewResult?.status === "rejected") {
          setReviewError(getApiErrorMessage(myReviewResult.reason, "Could not load your saved rating."));
        }
        const savedReview = myReviewResult?.status === "fulfilled"
          ? myReviewResult.value.data.data
          : null;
        setMyReview(savedReview);
        setRating(savedReview?.rating || 0);
        setComment(savedReview?.comment || "");
      })
      .catch((error) => {
        if (isCurrent) {
          setReviewError(getApiErrorMessage(error, "Could not load product reviews."));
        }
      })
      .finally(() => {
        if (isCurrent) setReviewsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [productId, productRating, productRatingCount, token, isCustomer, hasDatabaseProduct]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!rating || reviewSubmitting) return;

    setReviewSubmitting(true);
    setReviewError("");
    setReviewMessage("");
    try {
      const result = await submitProductReview(productId, { rating, comment });
      const savedReview = {
        _id: result.review._id,
        rating: result.review.rating,
        comment: result.review.comment,
      };
      setMyReview(savedReview);
      setRatingSummary({ rating: result.rating, ratingCount: result.ratingCount });
      setReviews((currentReviews) => {
        const updatedReview = {
          _id: `current-user-${productId}`,
          customerName: currentUser?.name || "You",
          ...result.review,
        };
        const existingReviewIndex = currentReviews.findIndex(
          (review) => review._id === updatedReview._id,
        );
        if (existingReviewIndex === -1) return [updatedReview, ...currentReviews].slice(0, 20);
        return currentReviews.map((review, index) =>
          index === existingReviewIndex ? { ...review, ...updatedReview } : review,
        );
      });
      setReviewMessage("Your rating has been saved.");
    } catch (error) {
      setReviewError(getApiErrorMessage(error, "Could not save your rating."));
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!product) return null;

  const image = Array.isArray(product.image)
    ? product.image[0]
    : product.image;

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex min-h-dvh items-center justify-center overflow-y-auto bg-[#0d2d22]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        className="relative my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#d9c9ab] bg-[#fffaf2] shadow-2xl md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c9ab] bg-[#fffaf2] text-xl font-semibold text-[#123d30] transition hover:bg-[#f3d7a1]"
          aria-label="Close product details"
        >
          ×
        </button>

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-64 w-full object-cover md:h-full md:min-h-[390px]"
          />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-[#f2e7cf] text-6xl" aria-hidden="true">
            🍲
          </div>
        )}

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2d6756]">
            {product.category && <span>{product.category}</span>}
            {product.subCategory && (
              <span className="rounded-full bg-[#e8f0e9] px-2.5 py-1 normal-case tracking-normal text-[#123d30]">
                {product.subCategory}
              </span>
            )}
          </div>
          <h2 id="product-details-title" className="mt-3 font-serif text-2xl font-bold text-[#123d30] sm:text-3xl">
            {product.name}
          </h2>
          {(ratingSummary?.ratingCount ?? product.ratingCount ?? 0) > 0 && (
            <p className="mt-3 text-sm font-semibold text-[#2d6756]">
              <span aria-hidden="true">★</span> {ratingSummary?.rating ?? product.rating} / 5
              {" · "}
              {ratingSummary?.ratingCount ?? product.ratingCount ?? 0} ratings
            </p>
          )}
          <p className="mt-4 leading-relaxed text-[#52665d]">
            {product.description || "Freshly prepared with carefully selected ingredients and ZaykaNest spices."}
          </p>
          <p className="mt-5 text-2xl font-black text-[#123d30]">
            {currency}{product.price}
          </p>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="mt-6 rounded-xl bg-[#123d30] px-5 py-3 text-sm font-bold text-[#fffaf2] transition hover:bg-[#2d6756] active:scale-[0.98]"
          >
            Add to cart
          </button>

          <section className="mt-7 border-t border-[#e7dcc7] pt-5">
            <h3 className="text-lg font-bold text-[#123d30]">Customer ratings</h3>
            {reviewsLoading ? (
              <p className="mt-3 text-sm text-[#52665d]">Loading ratings…</p>
            ) : reviewError && reviews.length === 0 ? (
              <p role="alert" className="mt-3 text-sm text-red-700">{reviewError}</p>
            ) : reviews.length === 0 ? (
              <p className="mt-3 text-sm text-[#52665d]">No ratings yet. Be the first to rate this dish.</p>
            ) : (
              <ul className="mt-3 max-h-36 space-y-3 overflow-y-auto">
                {reviews.map((review) => (
                  <li key={review._id} className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-[#244638]">
                      <span aria-hidden="true" className="text-[#9a702d]">★</span> {review.rating}/5 · {review.customerName}
                    </p>
                    {review.comment && <p className="mt-1 text-sm text-[#52665d]">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            )}

            {isCustomer && hasDatabaseProduct ? (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
                <fieldset className="block text-sm font-semibold text-[#244638]">
                  <legend>{myReview ? "Update your rating" : "Rate this dish"}</legend>
                  <span className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        className={`text-2xl ${value <= rating ? "text-[#d9a74a]" : "text-[#c9c2b5]"}`}
                      >
                        ★
                      </button>
                    ))}
                  </span>
                </fieldset>
                <label className="block text-sm font-semibold text-[#244638]">
                  Review (optional)
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={500}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-[#d9c9ab] bg-white p-3 text-sm font-normal text-stone-800"
                    placeholder="What did you think of this dish?"
                  />
                </label>
                {reviewError && <p role="alert" className="text-sm text-red-700">{reviewError}</p>}
                {reviewMessage && <p role="status" className="text-sm text-green-800">{reviewMessage}</p>}
                <button
                  type="submit"
                  disabled={!rating || reviewSubmitting}
                  className="rounded-xl bg-[#123d30] px-5 py-3 text-sm font-bold text-[#fffaf2] transition hover:bg-[#2d6756] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewSubmitting ? "Saving…" : myReview ? "Update rating" : "Submit rating"}
                </button>
              </form>
            ) : !isCustomer ? (
              <p className="mt-4 text-sm text-[#52665d]">Sign in with a customer account to rate this dish.</p>
            ) : (
              <p className="mt-4 text-sm text-[#52665d]">Ratings are available for menu items connected to the live menu.</p>
            )}
          </section>
        </div>
      </section>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;