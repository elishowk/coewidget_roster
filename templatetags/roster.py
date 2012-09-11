# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.inclusion_tag('roster/roster.html')
def rosterwidget(id, classes):
    return { 'id': id, 'classes': classes }

