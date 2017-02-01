#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
CGI Script for Project of WSE Spring 2016
by Youngsun Kim (youngsun.kim@nyu.edu) May 2016
"""

import cgi
# import cgitb
# cgitb.enable()
import sys

import image_finder


def script_main():
    form = cgi.FieldStorage()

    img_link = form.getvalue('img_link')
    if img_link == None:
        img_link = ''
    else:
        img_link = img_link.replace(' ', '')
        img_link = img_link.replace('..', '')

    print 'Content-Type: text/html; charset=UTF-8\r\n'
    print '<html>'

    print '<head>'
    print '<title>Web Search Engine - Spring 2016</title>'
    print "<link href='https://fonts.googleapis.com/css?family=Open+Sans:300,700' rel='stylesheet' type='text/css'>"
    print '</head>'

    print '<body style="margin:42;font-family:\'Open Sans\', sans-serif;">'
    print '<p>Web Search Engine - Spring 2016</p>'
    print '<h2>Project - SimImag: An Image Search Engine with Scattered Wavelet Network</h2>'
    print '<FORM action="wse_project.cgi" method="GET">'
    print 'Paste image URL:'
    print '<input type="text" name="img_link" value="%s" style="font-size:11pt;width:620;height:28" placeholder="e.g. https://image.server.com/sky.png">' % img_link
    print '<input type="submit" value="Find similar images" style="font-size:12pt;width:180;height:28">'
    print '</FORM>'
    print '</br>'

    if img_link is not None and len(img_link) > 0:
        if (not img_link.startswith('http://') and not img_link.startswith('https://')):
            print '</br></br></br>'
            print 'Invalid image link: Wrong scheme. (%s)' % img_link
        elif (not img_link.endswith('.png') and not img_link.endswith('.jpg') and not img_link.endswith('.jpeg')):
            print '</br></br></br>'
            print 'Invalid image link: Not an image link. (%s)' % img_link
        else:
            results = image_finder.find_images(img_link)
            if results is not None:
                print '<a href="%s">' % img_link
                print '<img src="%s" width="620" height="auto"></a>' % img_link
                print '<h4>Results for link <a href="%s">%s</a></h4>' % (img_link, img_link)
                
                print '<table border="0" width="100%%"><tr>'
                counter = 1
                for rst in results:
                    print '<td valign="top">'
                    keywords = rst[3].encode('utf-8')
                    # keywords = (keywords[:30] + ' ..') if len(keywords) > 30 else keywords
                    print '</br><p style="font-size:11pt">%s</p>' % keywords
                    print '<a href="%s">' % rst[2]
                    print '<img src="%s" style="max-width:95%%;max-height:95%%"></a>' % rst[1]
                    print '</td>'
                    if counter % 5 == 0:
                        print '</tr><tr>'
                    counter += 1
                print '</table>'

                print '</br></br></br>'
                print 'Most relevant %d image%s.' % (len(results), 's' if len(results) > 0 else '')
                print '</br></br>'
            else:
                print '</br></br></br>'
                print 'Invalid image link: the image is not directly accessable. (%s)' % img_link
    else:
        rc, rows = image_finder.get_random_rows()
        print '</br></br>'
        print '<table border="0" width="100%%">'
        print '<tr style="height:18"> Input an image link and find similar images. Total %d images were indexed. (All images are from <a href="http://pixabay.com">pixabay.com</a>.)</tr>' % int(rc)
        print '<tr>'
        counter = 1
        for rst in rows:
            print '<td valign="top">'
            print '<div style="max-width:240;max-height:150;overflow:hidden;">'
            print '<a href="%s">' % rst[1]
            print '<img src="%s" style="max-width:240;min-width:240;min-height:150"></a>' % rst[0]
            print '</div>'
            print '</td>'
            if counter % 5 == 0:
                print '</tr><tr>'
            counter += 1
            if counter > 25:
                break
        print '</table>'

    print '</br></br>© Youngsun Kim'
    print '</body>'
    print '</html>'

script_main()

# End of script
