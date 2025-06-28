# TandT - Digital Thinking Guidance Application

TandT (Think and Think) is a sophisticated web-based application designed to facilitate structured, data-driven decision-making and performance analysis. It implements systematic evaluation methodologies to help users move from subjective feelings to objective analysis.

This tool is powerful for everything from personal choices, like choosing a place to live, to complex business evaluations.

---

## Core Concepts & Model Types

The application's logic fundamentally changes based on the type of model you are working with.

### 1. Digital Decision Making Model (Type 1)

This model type is designed to help you make a clear **"YES" or "NO"** decision.

-   **Purpose**: To make a definitive choice by first establishing what's most important to you (e.g., "Should we hire this candidate?", "Is this the right apartment for me?").
-   **Modeling Mode**: The core of this mode is **building a dominance hierarchy**. For a chosen element, you are asked a series of questions: "If you have [this element] but you don't have [another element], would you still decide YES?". Your "YES" or "NO" answers systematically determine which elements are more critical than others. This process calculates a **Dominance Factor** for each element, giving you a clear, ranked list of your priorities.
-   **Analyzing Mode**: You evaluate a real-world scenario (e.g., a specific apartment listing) against your model using simple **Acceptable (👍) / Unacceptable (👎)** flags. The final decision is heavily influenced by the dominance hierarchy you built.
-   **Structuring/Dashboard View**: This view shows the results of your modeling phase—a **Dominance Chart** and a ranked list of factors, visually representing your established hierarchy of importance.

### 2. Digital Performance Review Model (Type 2)

This model type is designed to evaluate the current state of a system, project, or process and to identify what needs attention. It **does not use comparison or dominance**.

-   **Purpose**: To get a clear, prioritized list of what to work on (e.g., "How is our company performing this quarter?").
-   **Modeling Mode**: This mode is simple: you only **define the elements** that need to be reviewed. There is no comparison.
-   **Analyzing Mode**: You evaluate the current performance of each element using a two-tiered system:
    1.  **State**: Is the current state **Acceptable (👍)** or **Unacceptable (👎)**?
    2.  **Trend**: Is performance **Getting Better (📈)**, **Staying the Same (➖)**, or **Getting Worse (📉)**?
-   **Structuring/Dashboard View**: This view presents a **Performance Dashboard**. It's an automatically prioritized action list, highlighting elements that are "Unacceptable" or "Getting Worse" so you know exactly where to focus your efforts.
