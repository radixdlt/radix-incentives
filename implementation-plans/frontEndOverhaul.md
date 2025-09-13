Let's improve the incentives app. We're working on a point program, where the user can earn weekly AP (activity points) that are converted to SP (season points) at the end of the week. There are multiple different activity categories, which all have their own pool of SP/week. Activity categories contain many different sub-activities. The user's $ contribution to these sub-activities is tracked, and they earn AP based on their $ contribution to ALL sub-activities in an activity category. The sub-activity AP is added up per activity, and based on the user's total AP in the activity category sub-activities, they are ranked, and awarded SP at the end of the week.

Currently, the user can see their progress, and see what they should do spread over 3 pages:
1. The Dashboard page: if the user is logged in, they can see their Activity Points earned so far and Multiplier. They can also see their AP per activity category, and click the category to go to the leaderboard of that activity category. I don't like the design of the dashboard page, it should show more info and some info is even misleading. This is a big part of our rework, but I'll explain later what I want on that page. Basically, most of it can be scrapped.
2. The leaderboard page: if the user clicks the leaderboard page, they can see how much SP they have earned per season, and compare to other users. They can also see how much AP they have earned per activity category, per week, and compare to other users. And they can see what sub-activities their AP per category has originated from.
3. The earn page: On the earn page one can see all activity categories, with a description and amount of SP/week.

We will now start modifying those pages. Use your own judgement, it can be benificial to deviate from the plan, but please consult with me first. If we deviate, please also change this document, after the deviation.

## Earn page
Let's first work on the Earn page, as we need to settle on a design before we modify the Dashboard page to link to it:

The Earn page setup right now is fine. We get data from the activity_categories table, which is good, and then dynamically build it. However, we should have some text above all the cards, explaining what this page shows. It should tell these are ways to earn, and that they are all separate categories.
On the cards, we should also show the total dollar amount the user is investing into this category at this point. All of this data should come from the account_balances table, we should just fetch the latest entry for ALL connected accounts, and add them up (there is probably already a method on a service for this, if so, don't make a new one). An entry looks something like this (but then longer):
[
  {
    "usdValue": "62.3858223681427078764326100096973732892026364285920621812",
    "activityId": "c9_lp_der_lsulp-xrd"
  },
  {
    "usdValue": "62.3858223681427078764326100096973732892026364285920621812",
    "activityId": "c9_ho_lsulp-xrd"
  },
  {
    "usdValue": "0",
    "activityId": "c9_lp_blu_xrd-xwbtc"
  },
  {
    "usdValue": "0",
    "activityId": "c9_lp_der_xrd-xwbtc"
  },
  {
    "usdValue": "26.26526192232587314543584164348025258",
    "activityId": "c9_ho_xrd-xwbtc"
  },
  {
    "usdValue": "0",
    "activityId": "c9_lp_der_xrd-xusdc"
  },
  {
    "usdValue": "0",
    "activityId": "c9_ho_xrd-xusdc"
  },
  ]

Through the activity table, we can get what category all these activities belong to. There should already be a method for this in the activity service (or somewhere else), but if there's not, we should get it at that table.

We should also say how much AP/hour the user is gaining in this category (this should just be dollar value divided by hours in a week).

On the card, there should be a couple of stars, that are empty or filled, depending on some mission the user has completed for this category, to gamify it. To start with, let's just use $10, $100 and $1000 dollar contributed to the category.

If the user clicks the card, they are sent to a detailed overview of the category. The info on the card should stay (like the AP/hour, dollar contribution), and there should be a separate card for missions. If the user clicks that, a modal shows up which is kind of like the pokemon gym badges, but a badge for each of the mission achievements. It should tell them how the user can earn that badge. This system will be expanded a little bit, later, but for now just use those three dollar contributions I previously mentioned.

Then, below that, every sub-activity in this category should have a card. We fetch the data for the card from the activity table. We probably already have a method for that on that service. On the card of the sub-activity, the user's contribution to that sub-activity should be shown. And it should show how much AP/hour it makes them. The cards should be sorted by AP/hour (or dollar contribution, it will be the same order), and we should have filters per dApp. Every sub-activity has a prefix that corresponds to a dApp. This data can be found in the dapp table, with a link to the site of the dApp as well, which should pop up if the user clicks the card.

## Dashboard page
The only thing that's right about the dashboard is the multiplier. The activity points until now should be SP up until this point. Apart from that, everything is bad.

We should not show a week selector, we should always display info about the current week. Then, we should show small cards for every activity category, and show the user's leaderboard ranking, percentile, AP up until now, AP/hour and dollar contribution. We should show two buttons on the card, one to go to the leaderboard page of this activity category, and one to go to the Earn page activity category view for this category.

The user should be able to order the cards by AP earned, $-contribution, leaderboard percentile, and leaderboard ranking. The default mode should be leaderboard percentile.

I'm unsure if a card for every category is the right move, as it might take a lot of space, if you can think of a different data structure, that looks nice on mobile and desktop, and can display all that info without being extremely cramped, please suggest!

## Leaderboard
The leaderboard is good enough for now.