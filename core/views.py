# core/views.py
from django.shortcuts import render

def is_ajax(request):
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'

def render_fragment_or_full(request, fragment_path, context=None):
    ctx = context or {}
    if is_ajax(request):
        # return only the fragment HTML for AJAX
        return render(request, fragment_path, ctx)
    # normal full-page load -> wrap fragment into base.html by passing its path
    ctx['content_template'] = fragment_path
    return render(request, 'base.html', ctx)

def home(request):
    # pass any context needed by the fragment
    return render_fragment_or_full(request, 'pages/home.html', {'welcome': 'Hi'})

def create(request):
    return render_fragment_or_full(request, 'pages/create.html')

# add similar functions for search, notifications, user_profile, events, etc.

def search(request):
    return render_fragment_or_full(request, 'pages/search.html')

def notifications(request):
    return render_fragment_or_full(request, 'pages/notifications.html')

def user_profile(request):
    return render_fragment_or_full(request, 'pages/user_profile.html')

def log_in(request):
    return render_fragment_or_full(request, 'pages/log_in.html')

def report(request):
    return render_fragment_or_full(request, 'pages/reports.html')

def my_reports(request):
    return render_fragment_or_full(request, 'pages/my_reports.html')