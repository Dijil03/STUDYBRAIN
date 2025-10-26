import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

const VirtualScrollList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const scrollElementRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = totalHeight;
    }
  }, [totalHeight]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: containerHeight }}
      {...props}
    >
      {/* Scrollable container */}
      <div
        ref={scrollElementRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Virtual content */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item) => (
            <motion.div
              key={item.id || item.index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: item.top,
                left: 0,
                right: 0,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, item.index)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicators */}
      {scrollTop > 100 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors z-10"
          aria-label="Scroll to top"
        >
          ↑
        </motion.button>
      )}

      {scrollTop < totalHeight - containerHeight - 100 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          ↓
        </motion.button>
      )}
    </div>
  );
};

// Hook for virtual scrolling
export const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    scrollTop,
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
};

// Performance optimized list item
export const VirtualListItem = React.memo(({ 
  item, 
  index, 
  style, 
  isVisible, 
  children,
  ...props 
}) => {
  return (
    <div
      style={style}
      className={`virtual-list-item ${isVisible ? 'visible' : 'hidden'}`}
      {...props}
    >
      {children}
    </div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

// Infinite scroll virtual list
export const InfiniteVirtualList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  hasNextPage = false,
  isLoading = false,
  onLoadMore,
  renderItem,
  renderLoading,
  renderEnd,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const loadingRef = useRef(null);

  // Intersection observer for infinite loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, onLoadMore]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: containerHeight }}
      {...props}
    >
      <div
        className="h-full overflow-auto"
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item) => (
            <div
              key={item.id || item.index}
              style={{
                position: 'absolute',
                top: item.top,
                left: 0,
                right: 0,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, item.index)}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div ref={loadingRef} className="p-4 text-center">
            {renderLoading ? renderLoading() : 'Loading...'}
          </div>
        )}

        {/* End indicator */}
        {!hasNextPage && items.length > 0 && (
          <div className="p-4 text-center text-gray-500">
            {renderEnd ? renderEnd() : 'No more items'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualScrollList;
