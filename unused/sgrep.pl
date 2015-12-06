#!/usr/bin/perl -w

# Usage
# cgrep.pl -s <start pattern> -e <end pattern> -f <input file>

use strict;
use Getopt::Long;

my($start, $end, $file);

GetOptions(
    "start=s"   => \$start,
    "end=s"     => \$end,
    "file=s"    => \$file,
    );

die "All arguments are required" unless ($start && $end && $file);

if( defined( $file ) && -e $file )
{
    open( IN, $file ) || die "couldn't open file";
}

my @matches;
my $matching;
my $linecount = 0;
my $trailing = 0;

while( my $line = readline *IN)
{
    $linecount++;
    
    # see if we want to grab the line as a match tail
    if( $trailing > 0 )
    {
        push( @matches, $line );
	$trailing--;
	if ( $trailing == 0 )
	{ push (@matches, "\n" ); }
    }

    if( $line =~ /($start.*)/ )
    {   
        $matching = "true";
        push( @matches, $line );

	# in some cases our whole pattern will be in one line...
        if( $1 =~ /$end/){ $matching = "0"; }
        next;
    }

    if( $matching )
    {   
        if( $line =~ /(.*$end)/ )
        {   
            push( @matches, $line );
 	    $matching = "0";
	    $trailing = "1"; #set to grab one extra line at end of match
    }
        else
        {   
            push( @matches, $line );
        }
    }
}

print @matches;

