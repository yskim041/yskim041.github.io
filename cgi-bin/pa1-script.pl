#!/usr/bin/perl

    local ($buffer, @pairs, $pair, $name, $value, %FORM);
    # Read in text
    $ENV{'REQUEST_METHOD'} =~ tr/a-z/A-Z/;
    if ($ENV{'REQUEST_METHOD'} eq "GET")
    {
	   $buffer = $ENV{'QUERY_STRING'};
    }
    # Split information into name/value pairs
    @pairs = split(/&/, $buffer);
    foreach $pair (@pairs)
    {
    	($name, $value) = split(/=/, $pair);
    	$value =~ tr/+/ /;
    	$value =~ s/%(..)/pack("C", hex($1))/eg;
    	$FORM{$name} = $value;
    }
    $query_str = $FORM{query_str};
    $query_str =~ s/[^A-Za-z0-9]/ /g;
    $path_str = "Prog1ExampleDirectory";  # $FORM{path_str};

print "Content-type:text/html\r\n\r\n";
print "<html>";
print "<head>";
print "<title>Web Search Engine - Spring 2016</title>";
print "</head>";
print "<body>";
print "<p>Web Search Engine - Spring 2016</p>";
print "<h2>Programming Assignment 1 - Youngsun Kim</h2>";
print '<FORM action="pa1-script.pl" method="GET">
Query: <input type="text" name="query_str" size=65>
<input type="submit" value="Submit">
</FORM>';
print "</br>";
    if (length($query_str) > 0)
    {
        print "<h2>Results for query <u>$query_str</u> in directory <u>$path_str</u></h2>";
        $counter = 0;
        foreach $item (`java -jar wse_pa1.jar '${query_str}'`) {
            if ($counter % 2 == 0) {
                print '<h4 style="margin-bottom:0px; margin-left:12px;">';
                print "${item}</h4>";
            } else {
                print '<p style="margin-top:0px;margin-left:42px;">';
                print "${item}</p>"
            }
            $counter = $counter + 1
        }

        if ($counter == 0) {
            print '</br><p style="margin-top:0px;margin-left:42px;">';
            print "No mathing documents.</p>"
        }
    }
print "</body>";
print "</html>";