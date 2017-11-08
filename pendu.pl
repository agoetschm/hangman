#!/usr/bin/env perl

use strict;
use warnings;

my @dictionary = ("civiere", "pansement", "secouriste", "tension", "saturation");

my $randomIndex = int(rand(scalar @dictionary));
my $mysteryWord = $dictionary[$randomIndex];

#print $mysteryWord . "\n";

my $guess = "*" x (length $mysteryWord);

my @charsGuessed = ();
my @charsGuessedWrong = ();

my $lives = 10;

my @lifeState = ('
   ____
  |    | 
  |    o 
  |   /|\
  |    |
  |   / \
 _|_','
   ____
  |    | 
  |    o 
  |   /|\
  |    |
  |   / 
 _|_','
   ____
  |    | 
  |    o 
  |   /|\
  |    |
  |   
 _|_','
   ____
  |    | 
  |    o 
  |   /|
  |    |
  |   
 _|_','
   ____
  |    | 
  |    o 
  |    |
  |    |
  |   
 _|_','
   ____
  |    | 
  |    o 
  |    
  |    
  |   
 _|_','
   ____
  |    | 
  |    
  |    
  |    
  |   
 _|_','
   ____
  |     
  |     
  |    
  |    
  |   
 _|_','
   
  |     
  |     
  |    
  |    
  |   
 _|_','
   
      
       
      
      
     
 _ _');


while ($guess ne $mysteryWord and $lives > 0) {
    print "--------------------------------\n";
    print "$guess | already tried: { " . join(", ", @charsGuessedWrong) . " }\n";
    
    print "What letter do you think is in the mystery word? [a-z] ";
    my $charGuess = <>; chomp $charGuess;
    
    while ((grep {$_ eq $charGuess} @charsGuessed) or $charGuess !~ /\A[a-z]\z/) {
        print "The input has to be one letter in the range [a-z] and not in the already guessed letters {" . join(",", @charsGuessed) . "} ";
        $charGuess = <>; chomp $charGuess;
    }
    
    push(@charsGuessed, $charGuess);
    
    if (index($mysteryWord, $charGuess) != -1) {
        my $offset = 0;
        my $index = index($mysteryWord, $charGuess);
        while($index != -1) {
            $guess= substr($guess, 0, $index) . $charGuess . substr($guess, $index+1, length $guess);
            
            $index = index($mysteryWord, $charGuess, $offset);
            $offset = $index + 1;
        }
        
        
        print "Good guess!\n";
    } else {
        push(@charsGuessedWrong, $charGuess);
        $lives -= 1;
        print "Too bad: @lifeState[$lives]\n";
    }
}

if($lives > 0){
    print "Well done, the word was indeed $mysteryWord\n";
} else {
    print "You lost, the word was $mysteryWord\n";
}


