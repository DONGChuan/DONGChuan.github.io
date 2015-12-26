---
layout: page
title: About Me
subtitle: tra asds mmmas
menu: About
---
{% assign current_year = site.time | date: '%Y' %}

DONGChuan
===

## 概况

- Email： dongchuan55@gmail.com
- Website：[http://dongchuan.github.io](http://dongchuan.github.io)

## Skill Keywords

#### Software Engineer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_software_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>

#### J2EE Developer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_j2ee_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>

#### Mobile Developer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_mobile_app_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>

#### Web Developer Keywords
<div class="btn-inline">
    {% for keyword in site.skill_web_keywords %}
    <button class="btn btn-outline" type="button">{{ keyword }}</button>
    {% endfor %}
</div>