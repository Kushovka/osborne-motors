import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa'
import { reviews } from '../data/reviews'

const Stars = () => (
  <span className="reviews-banner__stars" aria-label="Five star rating">
    {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} />)}
  </span>
)

export const ReviewCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  if (reviews.length === 0) return null

  const activeReview = reviews[activeIndex] ?? reviews[0]
  const changeReview = (offset: number) => {
    setActiveIndex((index) => (index + offset + reviews.length) % reviews.length)
  }

  return (
    <section className="reviews-section" aria-labelledby="reviews-heading">
      <div className="reviews-banner">
        <img className="reviews-banner__image" src="/images/vehicle-photo-coming-soon.webp" alt="" aria-hidden="true" />
        <div className="reviews-banner__shade" aria-hidden="true" />

        <div className="reviews-banner__heading">
          <h2 id="reviews-heading">Real Customers.<br />Real Experiences.</h2>
        </div>

        <div className="reviews-banner__content" aria-live="polite">
          <Stars />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              className="reviews-banner__review"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -5 }}
              transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="reviews-banner__quote">“{activeReview.text}”</p>
              <p className="reviews-banner__author">Reviewed by {activeReview.author}</p>
            </motion.div>
          </AnimatePresence>
          <div className="reviews-banner__dots" aria-label="Choose a customer review">
            {reviews.map((review, index) => (
              <button
                key={`${review.author}-${index}`}
                type="button"
                aria-label={`Show review by ${review.author}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={index === activeIndex ? 'is-active' : ''}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="reviews-banner__arrows" aria-label="Review carousel controls">
          <button type="button" onClick={() => changeReview(-1)} aria-label="Show previous review"><FaArrowLeft /></button>
          <button type="button" onClick={() => changeReview(1)} aria-label="Show next review"><FaArrowRight /></button>
        </div>
      </div>
    </section>
  )
}
