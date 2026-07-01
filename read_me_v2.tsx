# UNOTRAVEL DEVELOPMENT GUIDE v2

> Master documentation for the UNOTRAVEL Front-end Renewal\
> Keep this document updated whenever a major feature or architectural
> decision changes.

------------------------------------------------------------------------

# 1. Project Overview

## Objective

Build a premium travel platform while keeping the existing backend
architecture intact.

Technology

-   React
-   TypeScript
-   Vite
-   Figma Make

Development Order

1.  Desktop
2.  Tablet
3.  Mobile
4.  Backend Integration
5.  Optimization

------------------------------------------------------------------------

# 2. Core Design Philosophy

Keywords

-   Premium
-   Editorial
-   Minimal
-   Swiss
-   Digital
-   Luxury

Never redesign the overall visual language unless explicitly requested.

Visual Rules

-   White background (#FFFFFF)
-   UNO Yellow only as accent
-   Blur only for Scroll Header / Handle Navigation
-   Avoid heavy glassmorphism
-   Consistent radius system
-   Motion should feel immediate but calm

------------------------------------------------------------------------

# 3. Development Rules

Always

-   Preserve comments.
-   Keep JSX hierarchy whenever possible.
-   Never guess backend fields.
-   Explain changes as:

Existing Code

↓

Modified Code

When inserting new code:

Existing Code

↓

Insert immediately below

Never rewrite large files unnecessarily.

------------------------------------------------------------------------

# 4. Backend Integration Rules

Every backend-related variable must include comments.

Examples

-   product
-   category
-   schedule
-   availableDates
-   reservation
-   review
-   faq
-   guide
-   refundPolicy
-   notices
-   price

Document each field with future backend intent.

------------------------------------------------------------------------

# 5. Responsive System

Desktop standard

1700 Canvas

↓

1600 Base

↓

ResizeObserver

↓

clientWidth

↓

Scale

↓

Dynamic Height

↓

Spacing Scale

Rules

-   width:100%
-   Avoid width:100vw except intentionally full-bleed sections.
-   Desktop minimum width:1024px.
-   Initial scale must prevent SPA layout jump.

------------------------------------------------------------------------

# 6. Performance Rules

Goals

-   No CLS
-   No layout jump
-   Immediate SPA navigation
-   Avoid unnecessary re-render

Check after every major UI update

-   Notebook
-   Desktop
-   Wide Desktop

Verify

-   section spacing
-   scale
-   dynamic height
-   scrollbar behavior

------------------------------------------------------------------------

# 7. Component Standards

Header

Completed

Footer

Completed

Product Navigation

Completed

Product Template

Completed

Product Detail

In Progress

Floating Toolbar

Planned

Viewed History

Planned

Reservation

In Progress

------------------------------------------------------------------------

# 8. Product Detail Standard

Structure

Hero

↓

Guide / Review / Schedule Tabs

↓

Premium Travel Document

↓

Available Dates

↓

Reservation Panel

↓

Editorial Images

↓

Important Notices

Floating Toolbar

Reservation

Inquiry

Kakao

Top

------------------------------------------------------------------------

# 9. UX Rules

Navigation must feel instant.

Avoid loading screens.

Prefer smooth transform animations over opacity-only transitions.

Hover

180\~220ms close delay.

Mega Panel

One connected surface.

------------------------------------------------------------------------

# 10. Mobile Roadmap

Desktop complete

↓

Tablet Landscape

↓

Tablet Portrait

↓

Mobile

↓

Optimization

------------------------------------------------------------------------

# 11. Bug Log

Current investigations

-   Notebook section gaps
-   Hero first-scroll jump
-   Scale vs spacing consistency
-   Responsive verification

------------------------------------------------------------------------

# 12. Changelog

Maintain chronological history.

Example

2026-06-30 - Desktop Responsive completed

2026-07-01 - Product Detail started

------------------------------------------------------------------------

# 13. AI Collaboration Rules

Every new conversation begins from this README.

Never

-   Change design language
-   Replace architecture without request

Always

-   Preserve maintainability
-   Prefer reusable components
-   Add backend comments
-   Respect existing UI

------------------------------------------------------------------------

# 14. Future Roadmap

Short Term

-   Product Detail
-   Reservation
-   Viewed
-   Floating Toolbar
-   Notebook fixes

Mid Term

-   Backend integration
-   Admin mapping
-   Reviews
-   FAQ

Long Term

-   Mobile
-   SEO
-   Accessibility
-   Performance
-   Three.js enhancement

------------------------------------------------------------------------

# 15. Personal Project Notes

Recent Viewed feature

ProductDetail saves viewed products.

Header reads those records and automatically expands VIEWED when
available.

Reservation concept

Use "Premium Travel Document", not a literal boarding pass.

This document should evolve with the project and become the single
source of truth.
