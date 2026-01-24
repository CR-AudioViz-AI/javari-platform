#!/bin/bash

# =============================================================================
# Orchestrator Test Runner
# Automated test harness for CRAudioVizAI Orchestrator system
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERCEL_URL="${VERCEL_URL:-http://localhost:3000}"
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"

# Test files
TEST_DIR="$(dirname "$0")"
ORCHESTRATOR_PAYLOAD="$TEST_DIR/test_orchestrator_payload.json"
CLAUDE_RELAY_PAYLOAD="$TEST_DIR/test_claude_relay.json"
GITHUB_WEBHOOK_PAYLOAD="$TEST_DIR/test_github_commit.json"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Install with: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
    print_success "jq is installed"
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi
    print_success "curl is installed"
    
    # Check environment variables
    if [ -z "$SUPABASE_URL" ]; then
        print_info "SUPABASE_URL not set. Edge function tests will be skipped."
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        print_info "SUPABASE_ANON_KEY not set. Edge function tests will be skipped."
    fi
    
    print_success "Prerequisites check complete"
}

# =============================================================================
# Test 1: Orchestrator API - Task Creation
# =============================================================================

test_orchestrator_api() {
    print_header "Test 1: Orchestrator API - Task Creation"
    
    print_info "Testing POST $VERCEL_URL/api/orchestrator"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$VERCEL_URL/api/orchestrator" \
        -H "Content-Type: application/json" \
        -d @"$ORCHESTRATOR_PAYLOAD")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "\nHTTP Status: $http_code"
    echo -e "Response Body:\n$body" | jq '.'
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Orchestrator API returned 200 OK"
        
        # Extract task_id
        task_id=$(echo "$body" | jq -r '.task_id')
        if [ "$task_id" != "null" ] && [ -n "$task_id" ]; then
            print_success "Task created with ID: $task_id"
            echo "$task_id" > /tmp/orchestrator_test_task_id.txt
            
            # Show SQL verification query
            echo -e "\n${YELLOW}Verification SQL:${NC}"
            echo "SELECT * FROM ai_tasks WHERE id = '$task_id';"
            echo "SELECT * FROM ai_events WHERE event_type = 'task_created' AND event_data->>'task_id' = '$task_id';"
        else
            print_error "Task ID not found in response"
        fi
    else
        print_error "Orchestrator API returned $http_code"
        echo "$body" | jq '.'
    fi
}

# =============================================================================
# Test 2: Claude Relay - Process Task
# =============================================================================

test_claude_relay() {
    print_header "Test 2: Claude Relay - Process Task"
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        print_info "Skipping: SUPABASE_URL or SUPABASE_ANON_KEY not set"
        return
    fi
    
    print_info "Testing POST $SUPABASE_URL/functions/v1/processClaudeTask"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$SUPABASE_URL/functions/v1/processClaudeTask" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "\nHTTP Status: $http_code"
    echo -e "Response Body:\n$body" | jq '.'
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Claude relay executed successfully"
        
        # Extract task_id and commit info
        task_id=$(echo "$body" | jq -r '.taskId')
        commit_sha=$(echo "$body" | jq -r '.commit_sha')
        github_url=$(echo "$body" | jq -r '.github_url')
        
        if [ "$task_id" != "null" ]; then
            print_success "Processed task: $task_id"
        fi
        
        if [ "$commit_sha" != "null" ]; then
            print_success "GitHub commit: $commit_sha"
        fi
        
        if [ "$github_url" != "null" ]; then
            print_success "File URL: $github_url"
        fi
        
        # Show SQL verification queries
        if [ "$task_id" != "null" ]; then
            echo -e "\n${YELLOW}Verification SQL:${NC}"
            echo "SELECT id, status, completed_at, result->'github_url' FROM ai_tasks WHERE id = '$task_id';"
            echo "SELECT * FROM ai_events WHERE event_type = 'commit' AND task_id = '$task_id';"
        fi
    else
        print_error "Claude relay returned $http_code"
        echo "$body" | jq '.'
    fi
}

# =============================================================================
# Test 3: GitHub Webhook - Push Event
# =============================================================================

test_github_webhook() {
    print_header "Test 3: GitHub Webhook - Push Event Processing"
    
    print_info "Testing POST $VERCEL_URL/api/github-webhook"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$VERCEL_URL/api/github-webhook" \
        -H "Content-Type: application/json" \
        -H "X-GitHub-Event: push" \
        -d @"$GITHUB_WEBHOOK_PAYLOAD")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "\nHTTP Status: $http_code"
    echo -e "Response Body:\n$body" | jq '.'
    
    if [ "$http_code" -eq 200 ]; then
        print_success "GitHub webhook processed successfully"
        
        commits_logged=$(echo "$body" | jq -r '.commits_logged')
        if [ "$commits_logged" != "null" ]; then
            print_success "Commits logged: $commits_logged"
        fi
        
        # Show SQL verification queries
        echo -e "\n${YELLOW}Verification SQL:${NC}"
        echo "SELECT * FROM ai_events WHERE event_type = 'github_push' ORDER BY timestamp DESC LIMIT 1;"
        echo "SELECT event_type, event_data->>'commit_id', event_data->>'commit_message' FROM ai_events WHERE event_type = 'commit' ORDER BY timestamp DESC LIMIT 5;"
    else
        print_error "GitHub webhook returned $http_code"
        echo "$body" | jq '.'
    fi
}

# =============================================================================
# Test 4: Update Knowledge - Embeddings
# =============================================================================

test_update_knowledge() {
    print_header "Test 4: Update Knowledge - Generate Embeddings"
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        print_info "Skipping: SUPABASE_URL or SUPABASE_ANON_KEY not set"
        return
    fi
    
    print_info "Testing POST $SUPABASE_URL/functions/v1/updateKnowledge"
    
    # Create minimal test payload
    test_payload='{
      "repository": "CR-AudioViz-AI/crav-docs",
      "filePath": "docs/blueprints/Javariverse_Master_Blueprint.md",
      "branch": "main",
      "category": "blueprints"
    }'
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$SUPABASE_URL/functions/v1/updateKnowledge" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "$test_payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "\nHTTP Status: $http_code"
    echo -e "Response Body:\n$body" | jq '.'
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Knowledge update executed successfully"
        
        chunks=$(echo "$body" | jq -r '.chunks_processed')
        embeddings=$(echo "$body" | jq -r '.embeddings_created')
        
        if [ "$chunks" != "null" ]; then
            print_success "Chunks processed: $chunks"
        fi
        
        if [ "$embeddings" != "null" ]; then
            print_success "Embeddings created: $embeddings"
        fi
        
        # Show SQL verification queries
        echo -e "\n${YELLOW}Verification SQL:${NC}"
        echo "SELECT id, source, category, chunk_index FROM embeddings WHERE category = 'blueprints' ORDER BY created_at DESC LIMIT 10;"
        echo "SELECT * FROM ai_events WHERE event_type = 'knowledge_updated' ORDER BY timestamp DESC LIMIT 1;"
        echo "SELECT * FROM ai_events WHERE event_type = 'blueprint_updated' ORDER BY timestamp DESC LIMIT 1;"
    else
        print_error "Knowledge update returned $http_code"
        echo "$body" | jq '.'
    fi
}

# =============================================================================
# Main Test Runner
# =============================================================================

main() {
    print_header "CRAudioVizAI Orchestrator Test Suite"
    
    echo "Configuration:"
    echo "  Vercel URL: $VERCEL_URL"
    echo "  Supabase URL: ${SUPABASE_URL:-[not set]}"
    echo ""
    
    check_prerequisites
    
    # Run tests
    test_orchestrator_api
    sleep 2  # Brief pause between tests
    
    test_github_webhook
    sleep 2
    
    test_claude_relay
    sleep 2
    
    test_update_knowledge
    
    print_header "Test Suite Complete"
    print_info "Review the output above and verify results in Supabase database"
}

# =============================================================================
# Usage Information
# =============================================================================

show_usage() {
    cat << EOF
Usage: $0 [options]

Options:
    --help              Show this help message
    --vercel-url URL    Set Vercel URL (default: http://localhost:3000)
    --supabase-url URL  Set Supabase URL
    --anon-key KEY      Set Supabase anonymous key

Environment Variables:
    VERCEL_URL          Vercel deployment URL
    SUPABASE_URL        Supabase project URL
    SUPABASE_ANON_KEY   Supabase anonymous key

Examples:
    # Local development testing
    ./run_tests.sh

    # Production testing
    VERCEL_URL=https://your-app.vercel.app \\
    SUPABASE_URL=https://your-project.supabase.co \\
    SUPABASE_ANON_KEY=your-anon-key \\
    ./run_tests.sh

    # Test individual endpoint
    curl -X POST http://localhost:3000/api/orchestrator \\
        -H "Content-Type: application/json" \\
        -d @tests/test_orchestrator_payload.json

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_usage
            exit 0
            ;;
        --vercel-url)
            VERCEL_URL="$2"
            shift 2
            ;;
        --supabase-url)
            SUPABASE_URL="$2"
            shift 2
            ;;
        --anon-key)
            SUPABASE_ANON_KEY="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run main test suite
main
