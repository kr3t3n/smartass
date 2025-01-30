import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./PostsCarousel.module.css";

export default function PostsCarousel({ posts, constructXLink }) {
  // Initialize carousel with options
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: true,
    skipSnaps: false,
    inViewThreshold: 0.7,
    breakpoints: {
      '(min-width: 1024px)': { 
        dragFree: false,
        containScroll: false
      }
    }
  });

  // Track selected slide for animations
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  // Update selected index when slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up scroll snaps and event listeners
  useEffect(() => {
    if (!emblaApi) return;

    // Get scroll snap positions
    setScrollSnaps(emblaApi.scrollSnapList());
    
    // Set up event listeners
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Cleanup
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Scroll to specific slide
  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  if (!posts || posts.length === 0) return null;

  return (
    <div className={styles.emblaWrapper}>
      <div className={styles.embla}>
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {posts.map((post, index) => (
              <div 
                className={`${styles.emblaSlide} ${
                  index === selectedIndex ? styles.isSelected : ""
                }`} 
                key={index}
              >
                <div className={styles.card}>
                  <p>{post}</p>
                  <a
                    href={constructXLink(post)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.postToX}
                  >
                    Post to X
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Only show dots on mobile */}
        {scrollSnaps.length > 1 && window.innerWidth < 1024 && (
          <div className={styles.emblaDots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.emblaDot} ${
                  index === selectedIndex ? styles.isSelected : ""
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 