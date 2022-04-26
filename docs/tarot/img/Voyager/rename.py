# import os
from PIL import Image

basewidth = 300
img = Image.open('aceSwords.png')
wpercent = (basewidth/float(img.size[0]))
hsize = int((float(img.size[1])*float(wpercent)))
img = img.resize((basewidth,hsize), Image.ANTIALIAS)
img.save('D:/git/page/docs/tarot/img/V1/aceSwords.png')
# os.rename('aceSwords.png', 'acePentacles1.png')
# os.rename('twoSwords.png', 'twoPentacles1.png')
# os.rename('threeSwords.png', 'threePentacles1.png')
# os.rename('fourSwords.png', 'fourPentacles1.png')
# os.rename('fiveSwords.png', 'fivePentacles1.png')
# os.rename('sixSwords.png', 'sixPentacles1.png')
# os.rename('sevenSwords.png', 'sevenPentacles1.png')
# os.rename('eightSwords.png', 'eightPentacles1.png')
# os.rename('nineSwords.png', 'ninePentacles1.png')
# os.rename('tenSwords.png', 'tenPentacles1.png')
# os.rename('pageSwords.png', 'pagePentacles1.png')
# os.rename('knightSwords.png', 'knightPentacles1.png')
# os.rename('queenSwords.png', 'queenPentacles1.png')
# os.rename('kingSwords.png', 'kingPentacles1.png')

# os.rename('acePentacles1.png', 'acePentacles.png')
# os.rename('twoPentacles1.png', 'twoPentacles.png')
# os.rename('threePentacles1.png', 'threePentacles.png')
# os.rename('fourPentacles1.png', 'fourPentacles.png')
# os.rename('fivePentacles1.png', 'fivePentacles.png')
# os.rename('sixPentacles1.png', 'sixPentacles.png')
# os.rename('sevenPentacles1.png', 'sevenPentacles.png')
# os.rename('eightPentacles1.png', 'eightPentacles.png')
# os.rename('ninePentacles1.png', 'ninePentacles.png')
# os.rename('tenPentacles1.png', 'tenPentacles.png')
# os.rename('pagePentacles1.png', 'pagePentacles.png')
# os.rename('knightPentacles1.png', 'knightPentacles.png')
# os.rename('queenPentacles1.png', 'queenPentacles.png')
# os.rename('kingPentacles1.png', 'kingPentacles.png')

import os
from PIL import Image, ImageDraw 

# 144 252
# 199 340
# basewidth = 200
# img = Image.open('D:/git/page/docs/tarot/img/Voyager/aceSwords.png')
# wpercent = (basewidth/float(img.size[0]))
# hsize = int((float(img.size[1])*float(wpercent)))
# img = img.resize((basewidth,hsize), Image.ANTIALIAS)
# img.save('D:/git/page/docs/tarot/img/V1/aceSwords.png')

  
# w, h = 200, 340
# shape = [(0, 0), (w, h)] 
  
# # creating new Image object 
# img = Image.new("RGBA", (w, h)) 

# im2 = Image.open('D:/git/page/docs/tarot/img/Voyager/aceSwords.png')
  
# # create rectangle image 
# img1 = ImageDraw.Draw(img)   
# img1.rectangle(shape, fill ="#E3D0A4") 
# img.paste(im2, (28, 44))
# img.save('D:/git/page/docs/tarot/img/V1/A.png')
# img.show()


directory = os.fsencode('D:/git/page/docs/tarot/img/Voyager')
w, h = 200, 340
shape = [(0, 0), (w, h)] 
for file in os.listdir(directory):
    filename = os.fsdecode(file)
    if filename.endswith(".png"):
        # # creating new Image object 
        img = Image.new("RGBA", (w, h)) 
        im2 = Image.open(os.path.join('D:/git/page/docs/tarot/img/Voyager/', filename))
        
        # create rectangle image 
        img1 = ImageDraw.Draw(img)   
        img1.rectangle(shape, fill ="#E3D0A4") 
        img.paste(im2, (28, 44))
        img.save(os.path.join('D:/git/page/docs/tarot/img/V1/', filename))
    # print(os.path.join('D:/git/page/docs/tarot/img/V1/', filename))