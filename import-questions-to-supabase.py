#!/usr/bin/env python3
"""
Import current 100 questions into Supabase question pool
and set up the active test configuration with locked answer pattern
"""

import os
import json
from supabase import create_client, Client

# Get credentials from environment
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_questions():
    """Import questions from questions.json into Supabase"""
    
    print("=" * 70)
    print("IMPORTING QUESTIONS TO SUPABASE")
    print("=" * 70)
    
    # Load questions from JSON
    with open('src/questions.json', 'r') as f:
        questions = json.load(f)
    
    print(f"\n✓ Loaded {len(questions)} questions from questions.json")
    
    # Analyze answer distribution
    answer_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
    for q in questions:
        answer_counts[q['correct_answer_letter']] += 1
    
    print(f"\nAnswer Distribution:")
    print(f"  Pool A: {answer_counts['A']} questions")
    print(f"  Pool B: {answer_counts['B']} questions")
    print(f"  Pool C: {answer_counts['C']} questions")
    print(f"  Pool D: {answer_counts['D']} questions")
    
    # Import questions into question_pool table
    print(f"\n📤 Importing questions to question_pool table...")
    
    imported_questions = []
    
    for idx, q in enumerate(questions, 1):
        # Extract options (remove letter prefix)
        options = {}
        for opt in q['options']:
            letter = opt[0]  # A, B, C, or D
            text = opt[3:].strip() if len(opt) > 3 else opt[2:].strip()  # Remove "A- " or "A-"
            options[letter] = text
        
        # Prepare question data
        question_data = {
            'correct_answer_letter': q['correct_answer_letter'],
            'category': q.get('category', 'GENERAL'),
            'question': q['question'],
            'option_a': options.get('A', ''),
            'option_b': options.get('B', ''),
            'option_c': options.get('C', ''),
            'option_d': options.get('D', ''),
            'is_active': True
        }
        
        try:
            # Insert into Supabase
            result = supabase.table('question_pool').insert(question_data).execute()
            
            if result.data:
                imported_questions.append({
                    'original_number': q.get('number', idx),
                    'id': result.data[0]['id'],
                    'correct_answer': q['correct_answer_letter']
                })
                print(f"  ✓ Imported Q{q.get('number', idx):3d} (Answer: {q['correct_answer_letter']})")
            else:
                print(f"  ✗ Failed to import Q{q.get('number', idx):3d}")
                
        except Exception as e:
            print(f"  ✗ Error importing Q{q.get('number', idx):3d}: {str(e)}")
    
    print(f"\n✓ Successfully imported {len(imported_questions)} questions")
    
    return imported_questions, questions

def setup_active_test_config(imported_questions, original_questions):
    """Set up the active test configuration with locked answer pattern"""
    
    print("\n" + "=" * 70)
    print("SETTING UP ACTIVE TEST CONFIGURATION")
    print("=" * 70)
    
    print("\n📋 Creating locked answer pattern (100 questions)...")
    
    # Map original question numbers to imported question IDs
    question_map = {q['original_number']: q for q in imported_questions}
    
    active_config = []
    
    for i, orig_q in enumerate(original_questions, 1):
        position = i
        orig_number = orig_q.get('number', i)
        correct_answer = orig_q['correct_answer_letter']
        
        # Get the imported question ID
        if orig_number in question_map:
            question_id = question_map[orig_number]['id']
            
            config_data = {
                'question_position': position,
                'question_id': question_id,
                'correct_answer_letter': correct_answer
            }
            
            try:
                result = supabase.table('active_test_config').insert(config_data).execute()
                if result.data:
                    active_config.append(config_data)
                    print(f"  ✓ Question Position {position:3d}: Answer {correct_answer}")
                else:
                    print(f"  ✗ Failed to set position {position}")
            except Exception as e:
                print(f"  ✗ Error at position {position}: {str(e)}")
    
    print(f"\n✓ Active test configuration complete: {len(active_config)} positions")
    
    return active_config

def verify_setup():
    """Verify the setup is correct"""
    
    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)
    
    # Count questions in pool
    try:
        pool_result = supabase.table('question_pool').select('correct_answer_letter', count='exact').execute()
        print(f"\n✓ Total questions in pool: {pool_result.count}")
    except Exception as e:
        print(f"\n✗ Error counting questions: {str(e)}")
        return
    
    # Count by answer letter
    for letter in ['A', 'B', 'C', 'D']:
        result = supabase.table('question_pool')\
            .select('*', count='exact')\
            .eq('correct_answer_letter', letter)\
            .execute()
        print(f"  Pool {letter}: {result.count} questions")
    
    # Count active test config
    config_result = supabase.table('active_test_config').select('*', count='exact').execute()
    print(f"\n✓ Active test positions configured: {config_result.count}")
    
    # Show answer pattern distribution
    pattern_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
    config_data = supabase.table('active_test_config').select('correct_answer_letter').execute()
    
    for item in config_data.data:
        pattern_counts[item['correct_answer_letter']] += 1
    
    print(f"\nLocked Answer Pattern:")
    print(f"  Position with A: {pattern_counts['A']}")
    print(f"  Position with B: {pattern_counts['B']}")
    print(f"  Position with C: {pattern_counts['C']}")
    print(f"  Position with D: {pattern_counts['D']}")
    
    print("\n" + "=" * 70)
    print("✅ IMPORT COMPLETE!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Build admin interface for question management")
    print("2. Add shuffle functionality")
    print("3. Integrate with test application")

def main():
    """Main import process"""
    try:
        # Import questions
        imported_questions, original_questions = import_questions()
        
        # Set up active test config
        active_config = setup_active_test_config(imported_questions, original_questions)
        
        # Verify
        verify_setup()
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
