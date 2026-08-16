package vip.xiaonuo.zj.modular.favorite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vip.xiaonuo.auth.core.util.StpClientUtil;
import vip.xiaonuo.zj.modular.favorite.entity.ZjFavorite;
import vip.xiaonuo.zj.modular.favorite.mapper.ZjFavoriteMapper;
import vip.xiaonuo.zj.modular.favorite.service.ZjFavoriteService;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.service.ZjListingService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ZjFavoriteServiceImpl extends ServiceImpl<ZjFavoriteMapper, ZjFavorite> implements ZjFavoriteService {

    @Resource
    private ZjListingService listingService;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean toggle(String listingId) {
        listingService.publicDetail(listingId);
        String userId = StpClientUtil.getLoginIdAsString();
        ZjFavorite existing = this.getOne(new LambdaQueryWrapper<ZjFavorite>()
                .eq(ZjFavorite::getUserId, userId).eq(ZjFavorite::getListingId, listingId));
        if (existing != null) {
            this.removeById(existing.getId());
            return false;
        }
        ZjFavorite favorite = new ZjFavorite();
        favorite.setUserId(userId);
        favorite.setListingId(listingId);
        favorite.setCreateTime(LocalDateTime.now());
        this.save(favorite);
        return true;
    }

    @Override
    public List<ZjListing> myFavorites() {
        List<String> listingIds = this.list(new LambdaQueryWrapper<ZjFavorite>()
                        .eq(ZjFavorite::getUserId, StpClientUtil.getLoginIdAsString())
                        .orderByDesc(ZjFavorite::getCreateTime))
                .stream().map(ZjFavorite::getListingId).toList();
        return listingService.publishedByIds(listingIds);
    }
}
