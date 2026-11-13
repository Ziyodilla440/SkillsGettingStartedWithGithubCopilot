"""
Tests for Mergington High School Activities API.
Follows the Arrange-Act-Assert (AAA) pattern.
"""

import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    # Arrange: Setup expected key
    expected_activity = "Chess Club"

    # Act: Request all activities
    response = client.get("/activities")

    # Assert: Verify response
    assert response.status_code == 200
    data = response.json()
    assert expected_activity in data
    assert "description" in data[expected_activity]


def test_signup_for_activity_success():
    # Arrange: Setup new email and target activity
    activity_name = "Basketball Team"
    email = "newstudent@mergington.edu"
    if email in activities[activity_name]["participants"]:
        activities[activity_name]["participants"].remove(email)

    # Act: Sign up student
    response = client.post(f"/activities/{activity_name}/signup?email={email}")

    # Assert: Check success
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"
    assert email in activities[activity_name]["participants"]


def test_signup_duplicate_fails():
    # Arrange: Existing participant in Chess Club
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    # Act: Attempt to sign up same participant again
    response = client.post(f"/activities/{activity_name}/signup?email={email}")

    # Assert: Should reject with 400
    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"


def test_signup_nonexistent_activity_fails():
    # Arrange: Non-existent activity
    activity_name = "Nonexistent Activity"
    email = "someone@mergington.edu"

    # Act: Attempt to sign up
    response = client.post(f"/activities/{activity_name}/signup?email={email}")

    # Assert: Should return 404
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_participant_success():
    # Arrange: Ensure email is in participants
    activity_name = "Chess Club"
    email = "daniel@mergington.edu"

    # Act: Unregister participant
    response = client.delete(f"/activities/{activity_name}/unregister?email={email}")

    # Assert: Should succeed
    assert response.status_code == 200
    assert email not in activities[activity_name]["participants"]


def test_unregister_participant_not_found():
    # Arrange: Email not in participants
    activity_name = "Basketball Team"
    email = "not_here@mergington.edu"

    # Act: Attempt unregister
    response = client.delete(f"/activities/{activity_name}/unregister?email={email}")

    # Assert: Should return 404
    assert response.status_code == 404
